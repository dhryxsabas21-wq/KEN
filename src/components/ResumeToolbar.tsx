"use client";

import Link from "next/link";

/**
 * Screen-only toolbar above the résumé sheet. Hidden when printing
 * (see .no-print in resume.css).
 */
export default function ResumeToolbar({ pdfName }: { pdfName: string }) {
  return (
    <div className="no-print sticky top-0 z-50 border-b border-hair bg-ground/85 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="navlink label inline-flex min-h-11 items-center text-ink-2 hover:text-ink">
          ← Portfolio
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn hidden min-h-11 sm:inline-flex"
          >
            Print
          </button>
          <a href="/resume.pdf" download={pdfName} className="btn btn-pigment min-h-11">
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}
