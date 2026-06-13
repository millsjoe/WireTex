import type { ReactNode } from "react";

interface DeviceFrameProps {
  device: "web" | "mobile";
  children: ReactNode;
}

export function DeviceFrame({ device, children }: DeviceFrameProps) {
  return (
    <div className={`device-frame ${device}`}>
      <div className="device-chrome">
        <div className="device-notch" aria-hidden="true" />
        <div className="device-screen">{children}</div>
      </div>
    </div>
  );
}
