function preload() {

}
function setup() {
    cam = new GameObject(new Vector2());
    cam.addComponents(new Camera(cam, 32))
    setCamera(cam);
    box = new GameObject(
        new Vector2(),
        new Renderer([0, 0, 0])
    );
    cam.getComponent("Camera").follow = box;
}
function update() {
    
}