
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

            <div className="page-header">
                <h1>Example Videos</h1>
                <button>
                <a href="/" style={{color: "black"}}>
                    &#8592; Home
                </a>
            </button>
            </div>

            <video className="example-video" controls>
                <source src="/assets/AScannerDarkly.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <video className="example-video" controls>
                <source src="/assets/PhantomMenace.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <video className="example-video" controls>
                <source src="/assets/MoonRaker.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            </div>
     

        </>
    );
}

export default ExampleVideos;
