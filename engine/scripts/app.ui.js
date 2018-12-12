function BuildDisplayFrame(){
	let type = "WebGL"
	if(!PIXI.utils.isWebGLSupported()){
	  type = "canvas"
	}

	//Create a Pixi Application    
	let app = new PIXI.Application({ 
	    width: 800,         // default: 800
	    height: 600,        // default: 600
	    antialias: false,    // default: false
	    transparent: false, // default: false
	    resolution: 1       // default: 1
	  }
	);

	app.renderer.view.style.position = "absolute";
	app.renderer.view.style.display = "block";
	app.renderer.autoResize = true;
	app.renderer.resize(window.innerWidth, window.innerHeight);
	app.renderer.backgroundColor = 0x2A2A2A;
	document.body.appendChild(app.view);
	return app;
}

function LoadMapTextures(){
	//Remove
}