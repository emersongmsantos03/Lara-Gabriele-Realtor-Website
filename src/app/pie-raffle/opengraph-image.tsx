import { ImageResponse } from "next/og";
import { lightLogoDataUri, ogColors } from "@/lib/og";
import { raffle } from "@/lib/raffle";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Win a pie for Christmas — Lara's Christmas Pie Raffle";

// The preview people see when the link is shared on Facebook, Nextdoor, texts…
export default async function RaffleOgImage() {
  const logo = await lightLogoDataUri();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: `radial-gradient(circle at 85% 10%, rgba(201,103,31,0.45), transparent 45%), radial-gradient(circle at 0% 100%, rgba(27,154,170,0.35), transparent 50%), ${ogColors.navy}`,
          color: ogColors.cream,
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 8, textTransform: "uppercase", color: ogColors.sea }}>
          Lara&apos;s Christmas Pie Raffle
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 116, lineHeight: 1, fontFamily: "serif" }}>
            Win a&nbsp;<span style={{ color: ogColors.sunset, fontStyle: "italic" }}>pie</span>&nbsp;for
          </div>
          <div style={{ display: "flex", fontSize: 116, lineHeight: 1.05, fontFamily: "serif" }}>Christmas.</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "rgba(248,244,236,0.8)" }}>
            3 neighbors win a fresh-baked holiday pie · Enter by {raffle.closesLabel}
          </div>
        </div>
        <img src={logo} width={420} height={80} alt="" />
      </div>
    ),
    size,
  );
}
