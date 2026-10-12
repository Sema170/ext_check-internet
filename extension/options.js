const addPair = (key, value) => {
    const list = document.getElementById("list");
    const listElement = document.createElement("tr");
    const key_node = document.createElement("td");
    const value_node = document.createElement("td");
    const button_node = document.createElement("td");
    const delButton = document.createElement("button");
    key_node.innerText = key;
    value_node.innerText = value;
    delButton.innerText = "Delete"
    delButton.addEventListener("click", async e => {
        e.target.parentElement.parentElement.remove();
        const {urls} = await chrome.storage.local.get("urls");
        if (urls){
            delete urls[key];
            await chrome.storage.local.set({urls});
        }
    });
    button_node.appendChild(delButton);    
    listElement.appendChild(key_node);
    listElement.appendChild(value_node);
    listElement.appendChild(button_node);
    list.appendChild(listElement);
}


const manualAddPair = async () => {
    const key = document.getElementById("key");
    const value = document.getElementById("value");
    const list = document.getElementById("list");
    if (key.value  && value.value){
        const options = await chrome.storage.local.get("urls");
        const urls = options?.urls || {};
        urls[key.value] = value.value;
        await chrome.storage.local.set({urls: urls});
        while(list.firstElementChild){
            list.removeChild(list.firstElementChild);
        }
        await updatePopup();
    } else{
        alert("Please enter name and url.");
    }
}

const updatePopup = async () => {
    const {urls} = await chrome.storage.local.get();
    if (urls){
        Object.entries(urls).forEach(([key, value]) => {
        console.log(key);
        addPair(key, value);
        })
    }
    
}

updatePopup();
const addPairButton = document.getElementById("addPairButton");
addPairButton.addEventListener("click", manualAddPair)