import { QRCodeSVG } from "qrcode.react";

interface LinkCardProps {
  url: string;
}

export default function LinkCard({ url }: LinkCardProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "6px",
        margin: "6px 0",
        backgroundColor: "#fff",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          marginRight: "6px",
        }}
      >
        <QRCodeSVG value={url} size={100} level="M" />
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            fontSize: "16px",
            wordBreak: "break-all",
          }}
        >
          {url}
        </a>
      </div>
    </div>
  );
}
