import { ImageResponse } from "next/og";
import { lightLogoDataUri, ogColors } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Pacific Friendly Realty — Lara Gabriele, San Diego REALTOR®";

export default async function OgImage() {
  const logo = await lightLogoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: ogColors.navy,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={900} height={172} alt="" />
        <div
          style={{
            marginTop: 56,
            fontSize: 30,
            color: ogColors.sunset,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Homes for sale across San Diego County
        </div>
      </div>
    ),
    size
  );
}
