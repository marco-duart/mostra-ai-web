import { MapPin, ExternalLink } from "lucide-react";
import { styled } from "@/theme/stitches.config";
import { Card, Badge } from "@/components/ui/Card";
import type { StoreLocation } from "@/types/domain";
import { deliveryModeLabel } from "@/utils/format";

const Stack = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "$3",
});

const Row = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "$3",
});

const Name = styled("h3", {
  margin: 0,
  fontSize: "$md",
  fontWeight: "$semibold",
});

const Address = styled("p", {
  margin: 0,
  marginTop: "$1",
  fontSize: "$sm",
  color: "$textMuted",
});

const Meta = styled("div", {
  marginTop: "$3",
  display: "flex",
  gap: "$2",
  flexWrap: "wrap",
});

const MapsLink = styled("a", {
  display: "inline-flex",
  alignItems: "center",
  gap: "$1",
  marginTop: "$3",
  fontSize: "$sm",
  fontWeight: "$medium",
  color: "$primary",
});

interface Props {
  locations: StoreLocation[];
}

export function LocationsList({ locations }: Props) {
  if (!locations.length) return null;
  return (
    <Stack>
      {locations.map((loc) => (
        <Card key={loc.id}>
          <Row>
            <div>
              <Name>
                <MapPin
                  size={14}
                  style={{ display: "inline", marginRight: 6, verticalAlign: "-2px" }}
                />
                {loc.name}
              </Name>
              <Address>{loc.address}</Address>
            </div>
            {loc.is_current_active && <Badge tone="brand">Atual</Badge>}
          </Row>
          <Meta>
            <Badge tone={loc.is_open_now ? "success" : "danger"}>
              {loc.is_open_now ? "Aberto" : "Fechado"}
            </Badge>
            <Badge>{deliveryModeLabel(loc.delivery_mode)}</Badge>
          </Meta>
          {loc.maps_url && (
            <MapsLink href={loc.maps_url} target="_blank" rel="noreferrer">
              Ver no mapa <ExternalLink size={14} />
            </MapsLink>
          )}
        </Card>
      ))}
    </Stack>
  );
}