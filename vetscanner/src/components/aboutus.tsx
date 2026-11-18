"use client"

import { Page, PageHeader, Panel } from "@/components/layout/page"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Panel className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">{title}</h2>
            <div className="leading-relaxed text-gray-700">{children}</div>
        </Panel>
    )
}

export default function AboutUs() {
    return (
        <Page>
            <PageHeader title="About Vetscanner" description="AI-assisted histopathology for veterinary diagnosis" />

            <Section title="Our mission">
                Reviewing a tumor biopsy under a microscope is slow, repetitive,
                and easy to get wrong when you're tired or rushed. Vetscanner
                exists to give veterinarians a second pair of eyes, upload a
                whole slide image, and our pipeline segments the tissue, flags
                the regions most likely to contain tumor, and classifies the
                subtype, turning an hour of manual review into a single report.
            </Section>

            <Section title="How it works">
                Vetscanner combines two models trained on the CATCH dataset, one
                of the largest annotated collections of canine cutaneous tumor
                slides available. A segmentation model locates tumor regions
                across the slide, and a classification model identifies the
                specific subtype, from mast cell tumors to melanomas. Every
                report includes an annotated thumbnail so you can see exactly
                where the model is looking.
            </Section>

            <Section title="A research tool, not a replacement">
                Vetscanner is built to support a veterinary pathologist's
                judgment, not substitute for it. Every diagnosis should be
                confirmed by a qualified professional before being acted on.
            </Section>

            <Section title="Data & acknowledgements">
                <p>
                    Our models are trained on the CAnine CuTaneous Cancer Histology
                    (CATCH) dataset, made publicly available through The Cancer
                    Imaging Archive. We're grateful to the authors and to everyone
                    who contributed samples, annotations, or technical support to
                    its creation.
                </p>
                <p className="text-sm text-gray-500 font-mono mt-3">
                    Wilm, F., Fragoso, M., Marzahl, C., Bertram, C., Klopfleisch, R.,
                    Maier, A., Aubreville, M., &amp; Breininger, K. (2022). CAnine
                    CuTaneous Cancer Histology Dataset (Version 1) [Data set]. The
                    Cancer Imaging Archive.{" "}
                    <a
                        href="https://doi.org/10.7937/TCIA.2M93-FX66"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#235F58] underline hover:no-underline"
                    >
                        https://doi.org/10.7937/TCIA.2M93-FX66
                    </a>
                </p>
            </Section>
        </Page>
    )
}
