"use client"

export default function AboutUs() {
    return (
        <div className="flex min-h-screen bg-white">
            <div className="w-10 bg-[#235F58] shrink-0" />

            <div className="flex flex-col px-16 lg:px-24 py-16 gap-10 max-w-4xl">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                        About Vetscanner
                    </h1>
                    <p className="text-muted-foreground text-lg mt-3">
                        AI-assisted histopathology for veterinary diagnosis
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">Our mission</h2>
                    <p className="text-lg leading-relaxed text-[#1A1A1A]/80">
                        Reviewing a tumor biopsy under a microscope is slow, repetitive,
                        and easy to get wrong when you're tired or rushed. Vetscanner
                        exists to give veterinarians a second pair of eyes, upload a
                        whole slide image, and our pipeline segments the tissue, flags
                        the regions most likely to contain tumor, and classifies the
                        subtype, turning an hour of manual review into a single report.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">How it works</h2>
                    <p className="text-lg leading-relaxed text-[#1A1A1A]/80">
                        Vetscanner combines two models trained on the CATCH dataset, one
                        of the largest annotated collections of canine cutaneous tumor
                        slides available. A segmentation model locates tumor regions
                        across the slide, and a classification model identifies the
                        specific subtype, from mast cell tumors to melanomas. Every
                        report includes an annotated thumbnail so you can see exactly
                        where the model is looking.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">A research tool, not a replacement</h2>
                    <p className="text-lg leading-relaxed text-[#1A1A1A]/80">
                        Vetscanner is built to support a veterinary pathologist's
                        judgment, not substitute for it. Every diagnosis should be
                        confirmed by a qualified professional before being acted on.
                    </p>
                </div>
            </div>
        </div>
    )
}