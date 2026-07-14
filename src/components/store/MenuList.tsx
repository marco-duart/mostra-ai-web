import { styled } from "@/theme/stitches.config";
import type { MenuCategory } from "@/types/domain";
import { formatPrice } from "@/utils/format";

const CategoryBlock = styled("div", {
  marginBottom: "$7",
});

const CategoryTitle = styled("h3", {
  margin: 0,
  marginBottom: "$4",
  fontSize: "$lg",
  fontWeight: "$bold",
  color: "$text",
  paddingBottom: "$2",
  borderBottom: "1px solid $border",
});

const ProductCard = styled("article", {
  display: "grid",
  gridTemplateColumns: "minmax(0,1fr) 96px",
  gap: "$4",
  padding: "$3 0",
  borderBottom: "1px solid $border",
  "&:last-child": { borderBottom: "none" },
});

const ProductInfo = styled("div", { minWidth: 0 });

const ProductName = styled("h4", {
  margin: 0,
  fontSize: "$md",
  fontWeight: "$semibold",
});

const ProductDesc = styled("p", {
  margin: 0,
  marginTop: "$1",
  fontSize: "$sm",
  color: "$textMuted",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

const ProductPrice = styled("div", {
  marginTop: "$2",
  fontSize: "$md",
  fontWeight: "$bold",
  color: "$primary",
});

const Thumb = styled("div", {
  width: 96,
  height: 96,
  borderRadius: "$md",
  backgroundColor: "$surfaceAlt",
  backgroundSize: "cover",
  backgroundPosition: "center",
  flexShrink: 0,
});

interface Props {
  menu: MenuCategory[];
}

export function MenuList({ menu }: Props) {
  return (
    <div>
      {menu.map((cat) => (
        <CategoryBlock key={cat.category_id}>
          <CategoryTitle>{cat.category_name}</CategoryTitle>
          {cat.products.map((p) => (
            <ProductCard key={p.id}>
              <ProductInfo>
                <ProductName>{p.name}</ProductName>
                {p.description && <ProductDesc>{p.description}</ProductDesc>}
                <ProductPrice>{formatPrice(p.price)}</ProductPrice>
              </ProductInfo>
              <Thumb
                style={{
                  backgroundImage: p.image_url ? `url(${p.image_url})` : undefined,
                }}
              />
            </ProductCard>
          ))}
        </CategoryBlock>
      ))}
    </div>
  );
}