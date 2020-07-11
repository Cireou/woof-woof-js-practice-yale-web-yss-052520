let url = "http://localhost:3000/pups"

document.addEventListener("DOMContentLoaded", () => {
    load_dogs();
    set_filter();
})

function set_filter(){
    let filter = qs("#good-dog-filter");
    filter.setAttribute("toggle_val", "OFF");

    filter.addEventListener("click", () => {
        let flipped_val =  flip_toggle(filter.attributes["toggle_val"].value)
        filter.setAttribute("toggle_val", flipped_val);
        filter.innerText = `Filter good dogs: ${flipped_val}`;
        load_filter(flipped_val);
    })
}

function flip_toggle(current_val){
    return (current_val == "ON") ? "OFF" : "ON";
}

function load_filter(flipped_val){
    fetch(url)
        .then(resp => resp.json())
        .then(dogs => filter_dogs(dogs, flipped_val)) 
}

function filter_dogs(dogs, desired_val){
    
    let filtered_dogs = [...dogs].filter(dog => is_allowed(desired_val, dog));
    let dog_bar = qs("#dog-bar");
    dog_bar.innerHTML = "";
    for (let dog of filtered_dogs){
        add_to_DOM(dog)
    }
}

function is_allowed(desired_val, dog){
    return (desired_val == "ON" && dog.isGoodDog) || (desired_val == "OFF")
}
function load_dogs(){
    fetch(url)
    .then(resp => resp.json())
    .then(dogs => {
        for (let dog of dogs){
            add_to_DOM(dog);
        }
    });
}

function add_to_DOM(dog){
    let dog_bar = qs("#dog-bar");
    let span = ce("span");
    span.innerText = dog.name;
    span.id = dog.id;

    span.addEventListener("click", () => {
        fetch(`${url}/${dog.id}`)
              .then(resp => resp.json())
              .then(dog => get_dog(dog));
    })
    dog_bar.append(span);
}


function get_dog(dog){
    let dog_info = qs("#dog-info");

    let img = ce("img");
    img.src = dog.image;

    let h2 = ce("h2");
    h2.innerText = dog.name;

    let btn = ce("button");
    btn.innerText = (dog.isGoodDog) ? "Good Dog!" : "Bad Dog!";
    btn.addEventListener("click", () => {
        fetch(`${url}/${dog.id}`, patchDogObject(dog.isGoodDog))
              .then(resp => resp.json())
              .then(new_dog => {
                btn.innerText = (new_dog.isGoodDog) ? "Good Dog!" : "Bad Dog!"; 
                dog.isGoodDog = new_dog.isGoodDog;
                let filter = qs("#good-dog-filter");
                if (filter.attributes["toggle_val"].value =="ON"){
                    load_filter("ON")
                }
            });
    })

    dog_info.innerHTML = "";
    dog_info.append(img, h2, btn);
}

function patchDogObject(current_val){
    return {
        method: "PATCH",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({isGoodDog: !current_val})
    }
}

function ce(item){
    return document.createElement(item);
}

function qs(item){
    return document.querySelector(item);
}