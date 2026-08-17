/* =====================================================
   HARSHA VARTHANAN
   PORTFOLIO INTERACTIONS
===================================================== */


/* =====================================================
   1. SCROLL REVEALS
===================================================== */

const revealElements =
    document.querySelectorAll(".reveal");


if ("IntersectionObserver" in window) {

    const revealObserver =
        new IntersectionObserver(

            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },

            {
                threshold: 0.12
            }

        );


    revealElements.forEach((element) => {

        revealObserver.observe(element);

    });

} else {

    revealElements.forEach((element) => {

        element.classList.add("visible");

    });

}


/* =====================================================
   2. SMOOTH INTERNAL LINKS
===================================================== */

document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {

        link.addEventListener(
            "click",
            function (event) {

                const targetId =
                    this.getAttribute("href");


                if (
                    !targetId ||
                    targetId === "#"
                ) {

                    return;

                }


                const target =
                    document.querySelector(targetId);


                if (!target) {

                    return;

                }


                event.preventDefault();


                target.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }
        );

    });



/* =====================================================
   3. CREDENTIAL SLIDER
===================================================== */

const credentialSlider =
    document.getElementById(
        "credentialSlider"
    );


const credentialPrev =
    document.getElementById(
        "credentialPrev"
    );


const credentialNext =
    document.getElementById(
        "credentialNext"
    );


if (
    credentialSlider &&
    credentialPrev &&
    credentialNext
) {

    credentialNext.addEventListener(
        "click",
        () => {

            credentialSlider.scrollBy({

                left:
                    credentialSlider.clientWidth * .8,

                behavior: "smooth"

            });

        }
    );


    credentialPrev.addEventListener(
        "click",
        () => {

            credentialSlider.scrollBy({

                left:
                    -credentialSlider.clientWidth * .8,

                behavior: "smooth"

            });

        }
    );

}



/* =====================================================
   4. CTF PRESENTATION
===================================================== */

const ctfCanvas =
    document.getElementById(
        "ctfCanvas"
    );


const ctfPrev =
    document.getElementById(
        "ctfPrev"
    );


const ctfNext =
    document.getElementById(
        "ctfNext"
    );


const ctfCounter =
    document.getElementById(
        "ctfCounter"
    );


const ctfLoading =
    document.getElementById(
        "ctfLoading"
    );


let ctfPdf = null;

let ctfPage = 1;

let ctfRendering = false;

let ctfPendingPage = null;

let pdfjs = null;


/*
    IMPORTANT:

    The browser cannot directly display
    a PowerPoint .pptx as individual slides.

    Therefore this viewer expects:

        assets/Presentation_CTF.pdf

    If you haven't created that PDF yet,
    the website will show the fallback image.
*/


if (ctfCanvas) {

    loadCTFPresentation();

}


/* =====================================================
   LOAD PDF
===================================================== */

async function loadCTFPresentation() {

    try {

        pdfjs =
            await import(
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs"
            );


        pdfjs.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";


        ctfPdf =
            await pdfjs
                .getDocument(
                    "./assets/Presentation_CTF.pdf"
                )
                .promise;


        if (ctfLoading) {

            ctfLoading.style.display =
                "none";

        }


        if (ctfCounter) {

            ctfCounter.textContent =
                `01 / ${String(ctfPdf.numPages).padStart(2, "0")}`;

        }


        await renderCTFPage(1);


    } catch (error) {

        console.warn(
            "Presentation_CTF.pdf not found."
        );


        /*
            Graceful fallback.

            Your CTF.png is already in the
            assets folder, so the website
            doesn't break if the PDF isn't
            created yet.
        */


        const frame =
            document.querySelector(
                ".ctf-frame"
            );


        if (frame) {

            frame.innerHTML = `

                <img
                    src="./assets/CTF.png"
                    alt="CEG Tech Forum project presentation"
                    class="ctf-fallback-image"
                >

            `;

        }


        if (ctfCounter) {

            ctfCounter.textContent =
                "PROJECT";

        }

    }

}


/* =====================================================
   RENDER CURRENT SLIDE
===================================================== */

async function renderCTFPage(
    pageNumber
) {

    if (
        !ctfPdf ||
        !ctfCanvas
    ) {

        return;

    }


    if (ctfRendering) {

        ctfPendingPage =
            pageNumber;

        return;

    }


    ctfRendering = true;


    try {

        const page =
            await ctfPdf.getPage(
                pageNumber
            );


        const container =
            ctfCanvas.parentElement;


        const containerWidth =
            container.clientWidth;


        const containerHeight =
            container.clientHeight;


        const baseViewport =
            page.getViewport({
                scale: 1
            });


        const availableWidth =
            containerWidth - 50;


        const availableHeight =
            containerHeight - 50;


        const scale =
            Math.min(

                availableWidth /
                    baseViewport.width,

                availableHeight /
                    baseViewport.height

            );


        const pixelRatio =
            window.devicePixelRatio || 1;


        const viewport =
            page.getViewport({

                scale:
                    scale * pixelRatio

            });


        ctfCanvas.width =
            viewport.width;


        ctfCanvas.height =
            viewport.height;


        ctfCanvas.style.width =
            `${viewport.width / pixelRatio}px`;


        ctfCanvas.style.height =
            `${viewport.height / pixelRatio}px`;


        const context =
            ctfCanvas.getContext(
                "2d"
            );


        await page.render({

            canvasContext:
                context,

            viewport:
                viewport

        }).promise;


        if (ctfCounter) {

            ctfCounter.textContent =
                `${String(pageNumber).padStart(2, "0")} / ${String(ctfPdf.numPages).padStart(2, "0")}`;

        }


    } catch (error) {

        console.error(
            "Slide rendering error:",
            error
        );

    }


    ctfRendering = false;


    if (
        ctfPendingPage !== null
    ) {

        const nextPage =
            ctfPendingPage;


        ctfPendingPage = null;


        renderCTFPage(
            nextPage
        );

    }

}


/* =====================================================
   NEXT SLIDE
===================================================== */

function nextCTFSlide() {

    if (!ctfPdf) {

        return;

    }


    if (
        ctfPage <
        ctfPdf.numPages
    ) {

        ctfPage++;


        renderCTFPage(
            ctfPage
        );

    }

}


/* =====================================================
   PREVIOUS SLIDE
===================================================== */

function previousCTFSlide() {

    if (!ctfPdf) {

        return;

    }


    if (ctfPage > 1) {

        ctfPage--;


        renderCTFPage(
            ctfPage
        );

    }

}


/* =====================================================
   PRESENTATION BUTTONS
===================================================== */

if (ctfNext) {

    ctfNext.addEventListener(
        "click",
        nextCTFSlide
    );

}


if (ctfPrev) {

    ctfPrev.addEventListener(
        "click",
        previousCTFSlide
    );

}


/* =====================================================
   KEYBOARD SLIDES
===================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        const active =
            document.activeElement;


        /*
            Don't hijack arrow keys if
            somebody is interacting with
            another control.
        */

        if (
            active &&
            (
                active.tagName === "INPUT" ||
                active.tagName === "TEXTAREA"
            )
        ) {

            return;

        }


        if (
            event.key === "ArrowRight"
        ) {

            nextCTFSlide();

        }


        if (
            event.key === "ArrowLeft"
        ) {

            previousCTFSlide();

        }

    }
);


/* =====================================================
   RESIZE PRESENTATION
===================================================== */

window.addEventListener(
    "resize",
    () => {

        if (ctfPdf) {

            renderCTFPage(
                ctfPage
            );

        }

    }
);