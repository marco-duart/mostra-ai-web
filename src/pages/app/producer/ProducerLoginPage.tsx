import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { styled } from "@/theme/stitches.config";
import { ProducerBrandLogo } from "@/components/producer/ProducerBrandLogo";
import { useProducerAuth } from "@/contexts/producerAuth";
import {
  useProducerCreateStoreMutation,
  useProducerLoginMutation,
  useProducerRegisterMutation,
} from "@/hooks/useProducerAuthMutations";
import type { DocumentType, OfferingType } from "@/types/producer";

const Wrap = styled("main", {
  minHeight: "100dvh",
  display: "grid",
  placeItems: "center",
  padding: "$4",
  background:
    "radial-gradient(900px 360px at 8% -4%, rgba(64,63,185,0.24), transparent), radial-gradient(1000px 420px at 100% 0%, rgba(239,62,65,0.15), transparent), #FBFAF5",
});

const Card = styled("section", {
  width: "100%",
  maxWidth: 520,
  borderRadius: "$xl",
  border: "1px solid #E6E4DC",
  backgroundColor: "#FFFFFF",
  padding: "$6",
  boxShadow: "0 14px 38px rgba(43,37,28,0.08)",
});

const Hero = styled("div", {
  display: "grid",
  placeItems: "center",
  gap: "$2",
  marginBottom: "$5",
});

const Step = styled("small", {
  fontSize: "$xs",
  fontWeight: "$semibold",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#403FB9",
});

const Title = styled("h1", {
  margin: 0,
  fontSize: "$2xl",
  color: "#1A1A1A",
  textAlign: "center",
});

const Subtitle = styled("p", {
  margin: "0",
  color: "#6B6B6B",
  fontSize: "$sm",
  textAlign: "center",
});

const Body = styled("div", {
  display: "grid",
  gap: "$4",
});

const FooterNote = styled("small", {
  color: "#6B6B6B",
  fontSize: "$xs",
});

const Form = styled("form", {
  display: "grid",
  gap: "$4",
});

const FieldGroup = styled("div", {
  display: "grid",
  gap: "$2",
});

const FieldLabel = styled("label", {
  color: "#1A1A1A",
  fontSize: "$sm",
  fontWeight: "$semibold",
});

const FieldHint = styled("small", {
  color: "#6B6B6B",
  fontSize: "$xs",
});

const FieldInput = styled("input", {
  width: "100%",
  borderRadius: "$md",
  border: "1px solid #E6E4DC",
  color: "#1A1A1A",
  backgroundColor: "#FFFFFF",
  padding: "$3 $4",
  fontSize: "$md",
  outline: "none",
  "&:focus": {
    borderColor: "#403FB9",
    boxShadow: "0 0 0 3px rgba(64,63,185,0.15)",
  },
});

const FieldSelect = styled("select", {
  width: "100%",
  borderRadius: "$md",
  border: "1px solid #E6E4DC",
  color: "#1A1A1A",
  backgroundColor: "#FFFFFF",
  padding: "$3 $4",
  fontSize: "$md",
  outline: "none",
  "&:focus": {
    borderColor: "#403FB9",
    boxShadow: "0 0 0 3px rgba(64,63,185,0.15)",
  },
});

const OptionGrid = styled("div", {
  display: "grid",
  gap: "$2",
});

const OptionButton = styled("button", {
  all: "unset",
  cursor: "pointer",
  boxSizing: "border-box",
  width: "100%",
  padding: "$3 $4",
  borderRadius: "$md",
  border: "1px solid #E6E4DC",
  backgroundColor: "#FFFFFF",
  color: "#1A1A1A",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  transition: "background-color 140ms ease, border-color 140ms ease",
  "&:focus-visible": {
    outline: "none",
    borderColor: "#403FB9",
    boxShadow: "0 0 0 3px rgba(64,63,185,0.15)",
  },
  variants: {
    selected: {
      true: {
        borderColor: "#403FB9",
        backgroundColor: "rgba(64,63,185,0.08)",
      },
    },
  },
});

const OptionButtonLabel = styled("strong", {
  fontSize: "$sm",
  color: "#1A1A1A",
});

const OptionButtonHint = styled("span", {
  fontSize: "$xs",
  color: "#6B6B6B",
});

const Actions = styled("div", {
  display: "grid",
  gap: "$2",
});

const ActionButton = styled("button", {
  all: "unset",
  boxSizing: "border-box",
  width: "100%",
  borderRadius: "$md",
  textAlign: "center",
  padding: "$3 $4",
  fontSize: "$md",
  fontWeight: "$semibold",
  cursor: "pointer",
  transition: "transform 120ms ease, opacity 120ms ease",
  "&:active:not(:disabled)": { transform: "scale(0.98)" },
  "&:disabled": { opacity: 0.55, cursor: "not-allowed" },
  variants: {
    variant: {
      primary: {
        backgroundColor: "#403FB9",
        color: "#FFFFFF",
      },
      secondary: {
        backgroundColor: "#FFFFFF",
        color: "#1A1A1A",
        border: "1px solid #E6E4DC",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "#6B6B6B",
      },
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

const ModeSwitch = styled("div", {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "$2",
});

type LoginForm = {
  email: string;
  password: string;
};

type RegisterForm = {
  email: string;
  password: string;
  name: string;
  document: string;
  documentType: DocumentType;
  offeringType: OfferingType | null;
  consumption: "YES" | "NO" | null;
  whatsapp: string;
};

type CreateStoreForm = {
  name: string;
  whatsapp: string;
  offeringType: OfferingType | null;
  consumption: "YES" | "NO" | null;
};

const EMPTY_CREATE_STORE_FORM: CreateStoreForm = {
  name: "",
  whatsapp: "",
  offeringType: null,
  consumption: null,
};

type ScreenMode = "welcome" | "login" | "register" | "createStore";

type RegisterStepKey =
  | "name"
  | "whatsapp"
  | "document"
  | "offering"
  | "consumption"
  | "email"
  | "password";

const requiresConsumptionStep = (offeringType: OfferingType | null) =>
  offeringType === "PRODUCT" || offeringType === "BOTH";

const buildRegisterSteps = (offeringType: OfferingType | null): RegisterStepKey[] => [
  "name",
  "whatsapp",
  "document",
  "offering",
  ...(requiresConsumptionStep(offeringType) ? (["consumption"] as const) : []),
  "email",
  "password",
];

const OFFERING_TYPE_OPTIONS: { value: OfferingType; label: string; hint: string }[] = [
  { value: "PRODUCT", label: "Produto", hint: "Vendo itens físicos ou comida." },
  { value: "SERVICE", label: "Serviço", hint: "Presto um serviço, sem produto." },
  { value: "BOTH", label: "Ambos", hint: "Vendo produtos e presto serviços." },
];

const CONSUMPTION_OPTIONS: { value: "YES" | "NO"; label: string; hint: string }[] = [
  { value: "YES", label: "Sim, são de consumo", hint: "Comida, bebida ou similares." },
  { value: "NO", label: "Não são de consumo", hint: "Mercadorias em geral." },
];

function parseApiMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) return "Não foi possível concluir agora.";
  const body = err.response?.data as { message?: string | { message?: string | string[] } };
  if (typeof body?.message === "string") return body.message;
  if (typeof body?.message === "object") {
    if (Array.isArray(body.message.message)) return body.message.message[0] ?? "Dados inválidos.";
    if (typeof body.message.message === "string") return body.message.message;
  }
  return err.message || "Erro inesperado.";
}

// Mesma checagem do app mobile (isDocumentConflict em register.tsx): um
// conflito 409 mencionando CPF/CNPJ na criação da conta indica que a
// pessoa já tem cadastro, então sugerimos login em vez de deixar o erro
// genérico confundir quem está tentando criar a loja de novo.
function isDocumentConflict(err: unknown): boolean {
  if (!axios.isAxiosError(err) || err.response?.status !== 409) return false;
  return /cpf|cnpj/i.test(parseApiMessage(err));
}

export function ProducerLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, store, signIn, setStore, signOut } = useProducerAuth();
  const [mode, setMode] = useState<ScreenMode>("welcome");
  const [registerStep, setRegisterStep] = useState(0);

  const login = useProducerLoginMutation();
  const register = useProducerRegisterMutation();
  const createStore = useProducerCreateStoreMutation();

  const [loginForm, setLoginForm] = useState<LoginForm>({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    email: "",
    password: "",
    name: "",
    document: "",
    documentType: "CPF",
    offeringType: null,
    consumption: null,
    whatsapp: "",
  });
  const [createStoreForm, setCreateStoreForm] = useState<CreateStoreForm>(EMPTY_CREATE_STORE_FORM);

  // Conta autenticada mas sem loja (ex.: recarregou a página no meio do
  // fluxo, ou entrou com uma conta criada só pelo app Cliente) - manda
  // direto pra criação da loja, igual ao app mobile faz na raiz do app.
  useEffect(() => {
    if (isAuthenticated && !store && mode === "welcome") {
      setMode("createStore");
    }
  }, [isAuthenticated, store, mode]);

  const registerSteps = useMemo(
    () => buildRegisterSteps(registerForm.offeringType),
    [registerForm.offeringType],
  );
  const registerStepKey = registerSteps[registerStep] ?? registerSteps[registerSteps.length - 1];

  const stepText = useMemo(() => {
    if (mode !== "register") return null;
    return `Passo ${registerStep + 1} de ${registerSteps.length}`;
  }, [mode, registerStep, registerSteps.length]);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    try {
      const data = await login.mutateAsync({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });
      signIn(data);
      if (data.store) {
        toast.success("Bem-vindo ao painel.");
        navigate("/producer", { replace: true });
      } else {
        // Conta autenticada mas sem loja ainda (ex.: criada só pelo app
        // Cliente) - manda pra criação da loja em vez do painel, igual ao
        // app mobile (login.tsx: router.replace(data.store ? ... )).
        toast("Falta só criar sua loja para continuar.");
        setMode("createStore");
      }
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  // Cadastro em duas chamadas (POST /auth/register + POST /producer/store),
  // igual ao app mobile (register.tsx): o servidor não aceita mais um único
  // payload combinado de conta+loja.
  const onRegister = async () => {
    if (!registerForm.offeringType) {
      toast.error("Escolha o que sua loja oferece.");
      return;
    }

    const needsConsumption = requiresConsumptionStep(registerForm.offeringType);
    if (needsConsumption && !registerForm.consumption) {
      toast.error("Informe se seus produtos são de consumo.");
      return;
    }

    let account;
    try {
      account = await register.mutateAsync({
        email: registerForm.email.trim(),
        password: registerForm.password,
        name: registerForm.name.trim(),
        document: registerForm.document.trim(),
        documentType: registerForm.documentType,
        acceptedAppTerms: true,
        acceptedLgpd: true,
      });
    } catch (err) {
      if (isDocumentConflict(err)) {
        toast.error("Você já tem uma conta com este CPF/CNPJ. Faça login para continuar.");
        setMode("login");
        return;
      }
      toast.error(parseApiMessage(err));
      return;
    }

    // Conta criada - autentica já (sem loja ainda) pra: (1) a próxima
    // chamada (POST /producer/store) ter o token disponível, e (2) não
    // perder a sessão caso a criação da loja falhe logo abaixo.
    signIn({ accessToken: account.accessToken, store: null });

    const storeDto = {
      name: registerForm.name.trim(),
      whatsapp: registerForm.whatsapp.trim(),
      offeringType: registerForm.offeringType,
      ...(needsConsumption ? { isConsumption: registerForm.consumption === "YES" } : {}),
      acceptedAccountTerms: true,
    };

    try {
      const newStore = await createStore.mutateAsync(storeDto);
      setStore(newStore);
      toast.success("Conta e loja criadas com sucesso.");
      navigate("/producer", { replace: true });
    } catch (err) {
      toast.error(`Sua conta foi criada, mas não deu para criar a loja agora: ${parseApiMessage(err)}`);
      // Mantém a sessão (conta autenticada sem loja) e leva pra tela de
      // criar loja, sem precisar cadastrar a conta de novo.
      setCreateStoreForm({
        name: storeDto.name,
        whatsapp: storeDto.whatsapp,
        offeringType: storeDto.offeringType,
        consumption: registerForm.consumption,
      });
      setMode("createStore");
    }
  };

  const onCreateStore = async (event: FormEvent) => {
    event.preventDefault();

    if (createStoreForm.name.trim().length < 2) {
      toast.error("Digite o nome da loja com pelo menos 2 letras.");
      return;
    }

    const digits = createStoreForm.whatsapp.replace(/\D/g, "");
    if (digits.length < 10) {
      toast.error("Digite um WhatsApp válido com DDD.");
      return;
    }

    if (!createStoreForm.offeringType) {
      toast.error("Escolha o que sua loja oferece.");
      return;
    }

    const needsConsumption = requiresConsumptionStep(createStoreForm.offeringType);
    if (needsConsumption && !createStoreForm.consumption) {
      toast.error("Informe se seus produtos são de consumo.");
      return;
    }

    try {
      const newStore = await createStore.mutateAsync({
        name: createStoreForm.name.trim(),
        whatsapp: digits.startsWith("55") ? digits : `55${digits}`,
        offeringType: createStoreForm.offeringType,
        ...(needsConsumption ? { isConsumption: createStoreForm.consumption === "YES" } : {}),
        acceptedAccountTerms: true,
      });
      setStore(newStore);
      toast.success("Loja criada com sucesso.");
      navigate("/producer", { replace: true });
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const nextRegisterStep = async (event: FormEvent) => {
    event.preventDefault();

    if (registerStepKey === "name" && registerForm.name.trim().length < 2) {
      toast.error("Digite o nome da loja com pelo menos 2 letras.");
      return;
    }

    if (registerStepKey === "whatsapp") {
      const digits = registerForm.whatsapp.replace(/\D/g, "");
      if (digits.length < 10) {
        toast.error("Digite um WhatsApp válido com DDD.");
        return;
      }

      setRegisterForm((current) => ({
        ...current,
        whatsapp: digits.startsWith("55") ? digits : `55${digits}`,
      }));
    }

    if (registerStepKey === "document") {
      const clean = registerForm.document.toUpperCase().replace(/[^0-9A-Z]/g, "");
      const inferredType: DocumentType | null = clean.length === 11 ? "CPF" : clean.length >= 14 ? "CNPJ" : null;
      const nextType = registerForm.documentType || inferredType;
      if (!nextType) {
        toast.error("Selecione CPF ou CNPJ para continuar.");
        return;
      }

      setRegisterForm((current) => ({
        ...current,
        document: clean,
        documentType: nextType,
      }));
    }

    if (registerStepKey === "offering" && !registerForm.offeringType) {
      toast.error("Escolha o que sua loja oferece.");
      return;
    }

    if (registerStepKey === "consumption" && !registerForm.consumption) {
      toast.error("Informe se seus produtos são de consumo.");
      return;
    }

    if (registerStepKey === "email" && !/^\S+@\S+\.\S+$/.test(registerForm.email.trim())) {
      toast.error("Informe um e-mail válido.");
      return;
    }

    if (registerStepKey === "password") {
      if (registerForm.password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres.");
        return;
      }
      await onRegister();
      return;
    }

    setRegisterStep((value) => value + 1);
  };

  const registerField = useMemo(() => {
    if (registerStepKey === "name") {
      return (
        <FieldGroup>
          <FieldLabel htmlFor="register_name">Como sua loja se chama?</FieldLabel>
          <FieldInput
            id="register_name"
            value={registerForm.name}
            onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Ex.: Pastelaria do Zé"
            autoFocus
          />
        </FieldGroup>
      );
    }

    if (registerStepKey === "whatsapp") {
      return (
        <FieldGroup>
          <FieldLabel htmlFor="register_whatsapp">Qual seu WhatsApp?</FieldLabel>
          <FieldHint>Vamos usar esse número para receber os pedidos dos clientes.</FieldHint>
          <FieldInput
            id="register_whatsapp"
            value={registerForm.whatsapp}
            onChange={(event) => setRegisterForm((current) => ({ ...current, whatsapp: event.target.value }))}
            placeholder="(62) 9 9999-9999"
            autoFocus
          />
        </FieldGroup>
      );
    }

    if (registerStepKey === "document") {
      return (
        <>
          <FieldGroup>
            <FieldLabel htmlFor="register_document">Seu CPF ou CNPJ</FieldLabel>
            <FieldHint>Aceitamos CNPJ novo, inclusive com letras.</FieldHint>
            <FieldInput
              id="register_document"
              value={registerForm.document}
              onChange={(event) => setRegisterForm((current) => ({ ...current, document: event.target.value }))}
              placeholder="Somente números ou letras"
              autoFocus
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="register_document_type">Tipo de documento</FieldLabel>
            <FieldSelect
              id="register_document_type"
              value={registerForm.documentType}
              onChange={(event) =>
                setRegisterForm((current) => ({
                  ...current,
                  documentType: event.target.value as DocumentType,
                }))
              }
            >
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
            </FieldSelect>
          </FieldGroup>
        </>
      );
    }

    if (registerStepKey === "offering") {
      return (
        <FieldGroup>
          <FieldLabel>O que sua loja oferece?</FieldLabel>
          <OptionGrid>
            {OFFERING_TYPE_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                type="button"
                selected={registerForm.offeringType === option.value}
                onClick={() =>
                  setRegisterForm((current) => ({
                    ...current,
                    offeringType: option.value,
                    consumption: requiresConsumptionStep(option.value) ? current.consumption : null,
                  }))
                }
              >
                <OptionButtonLabel>{option.label}</OptionButtonLabel>
                <OptionButtonHint>{option.hint}</OptionButtonHint>
              </OptionButton>
            ))}
          </OptionGrid>
        </FieldGroup>
      );
    }

    if (registerStepKey === "consumption") {
      return (
        <FieldGroup>
          <FieldLabel>Seus produtos são de consumo?</FieldLabel>
          <FieldHint>Comida e bebida contam como consumo.</FieldHint>
          <OptionGrid>
            {CONSUMPTION_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                type="button"
                selected={registerForm.consumption === option.value}
                onClick={() =>
                  setRegisterForm((current) => ({ ...current, consumption: option.value }))
                }
              >
                <OptionButtonLabel>{option.label}</OptionButtonLabel>
                <OptionButtonHint>{option.hint}</OptionButtonHint>
              </OptionButton>
            ))}
          </OptionGrid>
        </FieldGroup>
      );
    }

    if (registerStepKey === "email") {
      return (
        <FieldGroup>
          <FieldLabel htmlFor="register_email">Qual seu e-mail?</FieldLabel>
          <FieldHint>Você usa esse e-mail para acessar o painel.</FieldHint>
          <FieldInput
            id="register_email"
            type="email"
            value={registerForm.email}
            onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="voce@email.com"
            autoFocus
          />
        </FieldGroup>
      );
    }

    return (
      <FieldGroup>
        <FieldLabel htmlFor="register_password">Crie uma senha</FieldLabel>
        <FieldHint>Use pelo menos 6 caracteres.</FieldHint>
        <FieldInput
          id="register_password"
          type="password"
          value={registerForm.password}
          onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
          autoFocus
        />
      </FieldGroup>
    );
  }, [registerForm, registerStepKey]);

  if (isAuthenticated && store) {
    return <Navigate to="/producer" replace />;
  }

  return (
    <Wrap>
      <Card>
        <Hero>
          <ProducerBrandLogo size={132} variant="circle" frame="none" />
          {stepText ? <Step>{stepText}</Step> : null}
          <Title>
            {mode === "login"
              ? "Bem-vindo de volta"
              : mode === "register"
                ? "Vamos criar sua loja"
                : mode === "createStore"
                  ? "Falta pouco: crie sua loja"
                  : "Seu catálogo no bolso do cliente"}
          </Title>
          <Subtitle>
            {mode === "login"
              ? "Entre para gerenciar sua loja no painel web com o mesmo fluxo do app mobile."
              : mode === "register"
                ? "Uma pergunta de cada vez. Em menos de 2 minutos sua loja está pronta."
                : mode === "createStore"
                  ? "Sua conta já existe - preencha os dados abaixo para começar a vender."
                  : "Cadastre produtos, gere QR Code e receba pedidos no WhatsApp sem complicação."}
          </Subtitle>
        </Hero>

        {mode === "welcome" ? (
          <Actions>
            <ActionButton onClick={() => setMode("register")}>Criar minha loja</ActionButton>
            <ActionButton variant="secondary" onClick={() => setMode("login")}>Já tenho conta</ActionButton>
          </Actions>
        ) : mode === "login" ? (
          <Body>
            <Form onSubmit={onLogin}>
              <FieldGroup>
                <FieldLabel htmlFor="login_email">E-mail</FieldLabel>
                <FieldInput
                  id="login_email"
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="login_password">Senha</FieldLabel>
                <FieldInput
                  id="login_password"
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                />
              </FieldGroup>
              <ActionButton type="submit" disabled={login.isPending}>
                {login.isPending ? "Entrando..." : "Entrar"}
              </ActionButton>
            </Form>
            <ActionButton variant="ghost" onClick={() => navigate("/forgot-password")}>
              Esqueci minha senha
            </ActionButton>
            <ActionButton variant="ghost" onClick={() => setMode("welcome")}>
              Voltar
            </ActionButton>
          </Body>
        ) : mode === "createStore" ? (
          <Body>
            <Form onSubmit={onCreateStore}>
              <FieldGroup>
                <FieldLabel htmlFor="create_store_name">Como sua loja se chama?</FieldLabel>
                <FieldInput
                  id="create_store_name"
                  value={createStoreForm.name}
                  onChange={(event) =>
                    setCreateStoreForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Ex.: Pastelaria do Zé"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="create_store_whatsapp">Qual o WhatsApp da loja?</FieldLabel>
                <FieldInput
                  id="create_store_whatsapp"
                  value={createStoreForm.whatsapp}
                  onChange={(event) =>
                    setCreateStoreForm((current) => ({ ...current, whatsapp: event.target.value }))
                  }
                  placeholder="(62) 9 9999-9999"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>O que sua loja oferece?</FieldLabel>
                <OptionGrid>
                  {OFFERING_TYPE_OPTIONS.map((option) => (
                    <OptionButton
                      key={option.value}
                      type="button"
                      selected={createStoreForm.offeringType === option.value}
                      onClick={() =>
                        setCreateStoreForm((current) => ({
                          ...current,
                          offeringType: option.value,
                          consumption: requiresConsumptionStep(option.value) ? current.consumption : null,
                        }))
                      }
                    >
                      <OptionButtonLabel>{option.label}</OptionButtonLabel>
                      <OptionButtonHint>{option.hint}</OptionButtonHint>
                    </OptionButton>
                  ))}
                </OptionGrid>
              </FieldGroup>
              {requiresConsumptionStep(createStoreForm.offeringType) ? (
                <FieldGroup>
                  <FieldLabel>Seus produtos são de consumo?</FieldLabel>
                  <FieldHint>Comida e bebida contam como consumo.</FieldHint>
                  <OptionGrid>
                    {CONSUMPTION_OPTIONS.map((option) => (
                      <OptionButton
                        key={option.value}
                        type="button"
                        selected={createStoreForm.consumption === option.value}
                        onClick={() =>
                          setCreateStoreForm((current) => ({ ...current, consumption: option.value }))
                        }
                      >
                        <OptionButtonLabel>{option.label}</OptionButtonLabel>
                        <OptionButtonHint>{option.hint}</OptionButtonHint>
                      </OptionButton>
                    ))}
                  </OptionGrid>
                </FieldGroup>
              ) : null}
              <ActionButton type="submit" disabled={createStore.isPending}>
                {createStore.isPending ? "Criando..." : "Criar minha loja"}
              </ActionButton>
            </Form>
            <ActionButton variant="ghost" onClick={signOut}>
              Sair da conta
            </ActionButton>
          </Body>
        ) : (
          <Body>
            <ModeSwitch>
              <ActionButton variant="secondary" type="button" onClick={() => setMode("login")}>Entrar</ActionButton>
              <ActionButton type="button">Criar conta</ActionButton>
            </ModeSwitch>

            <Form onSubmit={nextRegisterStep}>
              {registerField}
              <Actions>
                <ActionButton type="submit" disabled={register.isPending}>
                  {registerStepKey === "password"
                    ? register.isPending
                      ? "Criando..."
                      : "Criar minha loja"
                    : "Continuar"}
                </ActionButton>
                <ActionButton
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (registerStep === 0) {
                      setMode("welcome");
                      return;
                    }
                    setRegisterStep((value) => value - 1);
                  }}
                >
                  Voltar
                </ActionButton>
              </Actions>
            </Form>
            <FooterNote>Ao criar a conta, os termos obrigatórios do app/conta/LGPD são aceitos.</FooterNote>
          </Body>
        )}
      </Card>
    </Wrap>
  );
}
