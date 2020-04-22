function preload() {

}
function setup() {
    cam = new GameObject(new Vector2(), new Camera(32));
    setCamera(cam);
    box = new GameObject(
        new Vector2(),
        new Renderer(0, 0, 0)
    );
    cam.getComponent("Camera").follow = box;
}
function update() {
    
}