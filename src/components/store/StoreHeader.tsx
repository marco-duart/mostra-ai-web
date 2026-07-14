import { Instagram, MessageCircle } from "lucide-react";
import { styled } from "@/theme/stitches.config";
import { Badge } from "@/components/ui/Card";
import type { StoreIdentity } from "@/types/domain";
import { formatWhatsappHref, instagramHref } from "@/utils/format";

const Banner = styled("div", {
  position: "relative",
  width: "100%",
  aspectRatio: "16 / 9",
  backgroundColor: "$secondary",
  backgroundSize: "cover",
  backgroundPosition: "center",
});

const HeaderInner = styled("div", {
  padding: "$4",
  paddingTop: 0,
  marginTop: "-56px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "$3",
});

const LogoWrap = styled("div", {
  width: 96,
  height: 96,
  borderRadius: "$lg",
  backgroundColor: "$surface",
  border: "3px solid $bg",
  boxShadow: "$md",
  overflow: "hidden",
  display: "grid",
  placeItems: "center",
  color: "$textMuted",
  fontWeight: "$bold",
  fontSize: "$2xl",
});

const StoreName = styled("h1", {
  margin: 0,
  fontSize: "$2xl",
  fontWeight: "$bold",
  lineHeight: 1.15,
});

const SocialRow = styled("div", {
  display: "flex",
  gap: "$2",
  flexWrap: "wrap",
});

const SocialLink = styled("a", {
  display: "inline-flex",
  alignItems: "center",
  gap: "$2",
  padding: "$2 $3",
  borderRadius: "$pill",
  backgroundColor: "$surfaceAlt",
  border: "1px solid $border",
  fontSize: "$sm",
  fontWeight: "$medium",
  color: "$text",
  "&:hover": { backgroundColor: "$primary", color: "$primaryContrast" },
});

interface Props {
  store: StoreIdentity;
  isOpen?: boolean;
}

export function StoreHeader({ store, isOpen }: Props) {
  const initials = store.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header>
      <Banner
        style={{
          backgroundImage: store.background_url
            ? `url(${store.background_url})`
            : undefined,
        }}
      />
      <HeaderInner>
        <LogoWrap>
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={`Logo ${store.name}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span>{initials || "?"}</span>
          )}
        </LogoWrap>
        <StoreName>{store.name}</StoreName>
        {typeof isOpen === "boolean" && (
          <Badge tone={isOpen ? "success" : "danger"}>
            {isOpen ? "Aberto agora" : "Fechado"}
          </Badge>
        )}
        <SocialRow>
          {store.whatsapp && (
            <SocialLink
              href={formatWhatsappHref(store.whatsapp)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} /> WhatsApp
            </SocialLink>
          )}
          {store.instagram && (
            <SocialLink
              href={instagramHref(store.instagram)}
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={16} /> @{store.instagram.replace(/^@/, "")}
            </SocialLink>
          )}
        </SocialRow>
      </HeaderInner>
    </header>
  );
}