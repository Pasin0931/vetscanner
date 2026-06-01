export default function About() {
    const plac:string = "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos."
    return (
        <>
            <div className="bg-[#DDDDDD] p-8 justify-center">
                <h1 className="text-[45px] text-center">Vet Scanner</h1>
                <p className="w-150 text-[20px] text-start">
                    {plac}
                    {plac}
                </p>
            </div>                        
        </>
    )
}