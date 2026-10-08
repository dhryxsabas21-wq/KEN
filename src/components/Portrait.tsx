import Image from "next/image";
import { profile, subject } from "@/lib/content";
import Tilt3D from "./Tilt3D";

/**
 * A stable 4:5 portrait with the complete photo aligned to the bottom.
 * The backplate, photo, and floating details occupy separate depth planes.
 */
export default function Portrait() {
  return (
    <div className="portrait-stage">
    <div aria-hidden="true" className="portrait-orbit" />
    <Tilt3D max={9} perspective={1200} className="hero-portrait relative">
      <div aria-hidden="true" className="portrait-backplate" />
      <div className="portrait-frame">
        <div aria-hidden="true" className="portrait-bg" />
        <div aria-hidden="true" className="portrait-grid" />

        <span aria-hidden="true" className="portrait-corner tl" />
        <span aria-hidden="true" className="portrait-corner tr" />
        <span aria-hidden="true" className="portrait-corner bl" />
        <span aria-hidden="true" className="portrait-corner br" />

        {subject.src && (
          <div className="portrait-photo">
            <Image
              src={subject.src}
              width={subject.width}
              height={subject.height}
              alt={subject.alt}
              sizes="(min-width: 1024px) 400px, (min-width: 480px) 340px, 78vw"
              preload
              className="portrait-img"
              draggable={false}
            />
          </div>
        )}
        <div aria-hidden="true" className="portrait-shine" />
        <div className="portrait-caption">
          <span className="label">{profile.firstName} {profile.lastName}</span>
          <span className="label text-pigment">Developer</span>
        </div>
      </div>
      <div className="portrait-note" aria-hidden="true">
        <span className="portrait-code">&lt;/&gt;</span>
        <span className="label">From idea<br /><span className="text-ink-2">to working software.</span></span>
      </div>
      <p
        className="label portrait-status"
        style={{ transform: "translateZ(60px)" }}
      >
        <span aria-hidden="true" />
        Available for projects
      </p>
    </Tilt3D>
    <p className="label portrait-hint text-muted"><span aria-hidden="true">✧</span> A little perspective changes everything.</p>
    </div>
  );
}
