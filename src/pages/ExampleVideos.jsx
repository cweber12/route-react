
const ExampleVideos = () => {
    return (
        <>
            
            <div className="page-container" 
            style={{
                gap: "20px", 
                paddingTop: "20px", 
                paddingBottom: "40px",
                marginTop: "-60px"
                }}>

            <div className="main-header">
                <h1>Example Videos</h1>
                <button>
                <a href="/" style={{color: "black"}}>
                    &#8592; Home
                </a>
            </button>
            </div>

            <video className="example-video" controls>
                <source src="/assets/example-videos/AScannerDarkly.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <video className="example-video" controls>
                <source src="/assets/example-videos/PhantomMenace.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <video className="example-video" controls>
                <source src="/assets/example-videos/MoonRaker.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            </div>
     

        </>
    );
}

export default ExampleVideos;
