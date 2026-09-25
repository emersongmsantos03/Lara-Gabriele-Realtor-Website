import { ImageResponse } from "next/og";
import { getArea } from "@/lib/areas";
import { lightLogoDataUri, ogColors } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "San Diego neighborhood guide by Lara Gabriele, REALTOR®";

export default async function AreaOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = getArea(slug);
  const name = area?.name ?? "San Diego";
  const logo = await lightLogoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 80px",
          background: ogColors.navy,
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: ogColors.sunset,
          }}
        >
          {area?.region ?? "San Diego County"}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 84,
            color: ogColors.cream,
            fontFamily: "serif",
            lineHeight: 1.05,
          }}
        >
          {`${name} Real Estate`}
        </div>
        <div style={{ marginTop: 24, fontSize: 30, color: "rgba(248,244,236,0.75)" }}>
          {area?.tagline ?? ""}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          width={420}
          height={80}
          alt=""
          style={{ position: "absolute", bottom: 50, left: 80 }}
        />
      </div>
    ),
    size
  );
}
