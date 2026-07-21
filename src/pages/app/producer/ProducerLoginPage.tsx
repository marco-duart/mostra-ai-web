import { useMemo, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { styled } from "@/theme/stitches.config";
import { ProducerBrandLogo } from "@/components/producer/ProducerBrandLogo";
import { useProducerAuth } from "@/contexts/producerAuth";
import { useProducerLoginMutation, useProducerRegisterMutation } from "@/hooks/useProducerAuthMutations";
import type { DocumentType } from "@/types/producer";

const Wrap = styled("main", {
  minHeight: "100dvh",
  display: "grid",
  placeItems: "center",
  padding: "$4",
  background:
    "radial-gradient(900px 360px at 8% -4%, rgba(228,87,46,0.24), transparent), radial-gradient(1000px 420px at 100% 0%, rgba(47,128,237,0.15), transparent), #FBFAF5",
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
  color: "#E4572E",
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
    borderColor: "#E4572E",
    boxShadow: "0 0 0 3px rgba(228,87,46,0.15)",
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
    borderColor: "#E4572E",
    boxShadow: "0 0 0 3px rgba(228,87,46,0.15)",
  },
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
        backgroundColor: "#E4572E",
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
  whatsapp: string;
};

type ScreenMode = "welcome" | "login" | "register";

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

export function ProducerLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, signIn } = useProducerAuth();
  const [mode, setMode] = useState<ScreenMode>("welcome");
  const [registerStep, setRegisterStep] = useState(0);

  const login = useProducerLoginMutation();
  const register = useProducerRegisterMutation();

  const [loginForm, setLoginForm] = useState<LoginForm>({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    email: "",
    password: "",
    name: "",
    document: "",
    documentType: "CPF",
    whatsapp: "",
  });

  const stepText = useMemo(() => {
    if (mode !== "register") return null;
    return `Passo ${registerStep + 1} de 5`;
  }, [mode, registerStep]);

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
      toast.success("Bem-vindo ao painel.");
      navigate("/producer", { replace: true });
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const onRegister = async () => {
    try {
      const data = await register.mutateAsync({
        email: registerForm.email.trim(),
        password: registerForm.password,
        name: registerForm.name.trim(),
        document: registerForm.document.trim(),
        documentType: registerForm.documentType,
        whatsapp: registerForm.whatsapp.trim(),
        acceptedAppTerms: true,
        acceptedAccountTerms: true,
        acceptedLgpd: true,
      });
      signIn(data);
      toast.success("Conta criada com sucesso.");
      navigate("/producer", { replace: true });
    } catch (err) {
      toast.error(parseApiMessage(err));
    }
  };

  const nextRegisterStep = async (event: FormEvent) => {
    event.preventDefault();
    if (registerStep === 0 && registerForm.name.trim().length < 2) {
      toast.error("Digite o nome da loja com pelo menos 2 letras.");
      return;
    }

    if (registerStep === 1) {
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

    if (registerStep === 2) {
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

    if (registerStep === 3 && !/^\S+@\S+\.\S+$/.test(registerForm.email.trim())) {
      toast.error("Informe um e-mail válido.");
      return;
    }

    if (registerStep === 4) {
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
    if (registerStep === 0) {
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

    if (registerStep === 1) {
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

    if (registerStep === 2) {
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

    if (registerStep === 3) {
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
  }, [registerForm, registerStep]);

  if (isAuthenticated) {
    return <Navigate to="/producer" replace />;
  }

  return (
    <Wrap>
      <Card>
        <Hero>
          <ProducerBrandLogo size={132} variant="circle" frame="none" />
          {stepText ? <Step>{stepText}</Step> : null}
          <Title>{mode === "login" ? "Bem-vindo de volta" : mode === "register" ? "Vamos criar sua loja" : "Seu catálogo no bolso do cliente"}</Title>
          <Subtitle>
            {mode === "login"
              ? "Entre para gerenciar sua loja no painel web com o mesmo fluxo do app mobile."
              : mode === "register"
                ? "Uma pergunta de cada vez. Em menos de 2 minutos sua loja está pronta."
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
            <ActionButton variant="ghost" onClick={() => setMode("welcome")}>
              Voltar
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
                  {registerStep === 4 ? (register.isPending ? "Criando..." : "Criar minha loja") : "Continuar"}
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
