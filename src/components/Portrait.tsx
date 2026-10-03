import Image from "next/image";
import { subject } from "@/lib/content";
import Tilt3D from "./Tilt3D";

/**
 * The hero portrait: the photo fully inside its frame, the frame's top
 * and bottom edges level with the copy column beside it (see
 * .hero-portrait in globals.css). Three depth planes — frame, corner
 * marks, photo — plus a status chip in front, so it shears in real 3D
 * when it tilts toward the pointer (or with scroll on touch screens).
 */
export default function Portrait() {
  return (
    <Tilt3D max={8} perspective={1100} className="hero-portrait relative">
      <div className="portrait-frame">
        <div className="portrait-bg" />

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
              sizes="(min-width: 1024px) 420px, 340px"
              preload
              className="portrait-img"
              draggable={false}
            />
          </div>
        )}
      </div>

      {/* Status chip, floating in front of everything */}
      <p
        className="label absolute -bottom-4 left-5 flex items-center gap-2 border border-hair bg-ground px-3 py-2 text-ink"
        style={{ transform: "translateZ(60px)" }}
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 bg-pigment" />
        Available for projects
      </p>
    </Tilt3D>
  );
}
