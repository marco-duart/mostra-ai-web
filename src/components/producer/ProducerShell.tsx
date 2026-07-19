import { useMemo, type PropsWithChildren } from "react";
import { Link, NavLink } from "react-router-dom";
import { LayoutDashboard, MapPin, Package, Palette, Tags, LogOut, Store } from "lucide-react";
import { styled } from "@/theme/stitches.config";
import { Button } from "@/components/ui/Button";
import { useProducerAuth } from "@/contexts/producerAuth";
import { ProducerBrandLogo } from "@/components/producer/ProducerBrandLogo";

const Wrap = styled("div", {
  minHeight: "100dvh",
  background:
    "radial-gradient(1200px 400px at 8% -10%, rgba(228,87,46,0.2), transparent), radial-gradient(1100px 420px at 92% 0%, rgba(47,128,237,0.12), transparent), $bg",
});

const Header = styled("header", {
  position: "sticky",
  top: 0,
  zIndex: 20,
  backgroundColor: "rgba(15,15,16,0.84)",
  borderBottom: "1px solid $border",
  backdropFilter: "blur(8px)",
});

const HeaderInner = styled("div", {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "$3 $4",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "$3",
});

const Brand = styled(Link, {
  display: "inline-flex",
  alignItems: "center",
  gap: "$2",
  fontWeight: "$semibold",
});

const BrandText = styled("div", {
  display: "grid",
  gap: 2,
});

const BrandLabel = styled("strong", {
  fontSize: "$sm",
  lineHeight: 1.1,
});

const Body = styled("div", {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "$4",
  padding: "$4",
  "@lg": {
    gridTemplateColumns: "260px minmax(0, 1fr)",
  },
});

const Sidebar = styled("aside", {
  display: "flex",
  flexDirection: "row",
  gap: "$2",
  overflowX: "auto",
  paddingBottom: "$1",
  "@lg": {
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 86,
    alignSelf: "start",
  },
});

const NavItem = styled(NavLink, {
  display: "inline-flex",
  alignItems: "center",
  gap: "$2",
  whiteSpace: "nowrap",
  border: "1px solid $border",
  color: "$textMuted",
  backgroundColor: "$surface",
  borderRadius: "$md",
  padding: "$2 $3",
  fontSize: "$sm",
  transition: "all 140ms ease",
  "&.active": {
    color: "$text",
    borderColor: "$primaryBorder",
    backgroundColor: "$primarySoft",
  },
});

const Main = styled("section", {
  display: "flex",
  flexDirection: "column",
  gap: "$4",
});

const StoreName = styled("small", {
  color: "$textMuted",
  display: "block",
  maxWidth: 200,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export function ProducerShell({ children }: PropsWithChildren) {
  const { store, signOut } = useProducerAuth();
  const catalogUrl = store?.slug ? `http://mostraai.app.br/${store.slug}` : "http://mostraai.app.br";

  const nav = useMemo(
    () => [
      { to: "/producer", label: "Resumo", icon: <LayoutDashboard size={16} /> },
      { to: "/producer/store", label: "Loja", icon: <Store size={16} /> },
      { to: "/producer/products", label: "Produtos", icon: <Package size={16} /> },
      { to: "/producer/categories", label: "Categorias", icon: <Tags size={16} /> },
      { to: "/producer/locations", label: "Locais", icon: <MapPin size={16} /> },
    ],
    [],
  );

  return (
    <Wrap>
      <Header>
        <HeaderInner>
          <div>
            <Brand to="/producer">
              <ProducerBrandLogo size={34} variant="circle" frame="none" />
              <BrandText>
                <BrandLabel>Painel Producer</BrandLabel>
                <StoreName>{store?.name ?? "Sem loja"}</StoreName>
              </BrandText>
            </Brand>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button variant="secondary" size="sm" onClick={signOut}>
              <LogOut size={14} />
              Sair
            </Button>
          </div>
        </HeaderInner>
      </Header>

      <Body>
        <Sidebar>
          {nav.map((item) => (
            <NavItem key={item.to} to={item.to} end={item.to === "/producer"}>
              {item.icon}
              {item.label}
            </NavItem>
          ))}
          <NavItem to={catalogUrl} target="_blank" rel="noreferrer">
            <Palette size={16} />
            Ver catalogo
          </NavItem>
        </Sidebar>

        <Main>{children}</Main>
      </Body>
    </Wrap>
  );
}
