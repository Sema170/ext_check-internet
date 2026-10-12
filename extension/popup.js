import { apiUrl, apiMyIp } from "./config.js";


async function checkUrl(url){
    try{
        const response = await fetch(url, {method:"HEAD"});
        console.log(response.status);
        return response.status
    } catch{
        return "no connection"
    }
}


const options =  await chrome.storage.local.get()

function updateIp(){
    const body = document.getElementsByTagName("BODY")[0];
    
    const myIpNode = document.createElement("h1");
    body.appendChild(myIpNode);
    if(options.getIp){
        myIpNode.innerHTML = `My&nbspIP:&nbsppending...`;
        let myIp
        (async() => {
            try{
            myIp = (await (await fetch(apiMyIp)).json()).myIp;
            } catch (err){
            myIp = "no&nbspconnection";
            console.error("Fetch ip fails.", err);
            }    
            myIpNode.innerHTML = `My&nbspIP:&nbsp${myIp}`;
        })();   
    } else{
        myIpNode.innerHTML = "My&nbspIP:&nbspsuspended"
    }
    body.prepend(myIpNode);
}

function updateUrls(){
    if (options.urls){
        Object.entries(options.urls).map(async ([key, value]) => {
            const list = document.getElementById("list");
            const listElement = document.createElement("tr");
            const key_node = document.createElement("td");
            const value_node = document.createElement("td");
            key_node.innerText = key;
            value_node.innerText = "pending...";
            listElement.appendChild(key_node);
            listElement.appendChild(value_node);
            list.appendChild(listElement);
            if (options.checkUrls){
                const response = await checkUrl(value);
                if (response === "no connection"){
                    key_node.style.backgroundColor = "#ffb3b3";
                    value_node.style.backgroundColor = "#ffb3b3";
                } else{
                    key_node.style.backgroundColor = "#8cd98c";
                    value_node.style.backgroundColor = "#8cd98c";
                }
                value_node.innerText = response;
            } else{
                key_node.style.backgroundColor = "#ffc61a";
                value_node.style.backgroundColor = "#ffc61a";
                value_node.innerText = "suspended";
            }
        })     
    }
}
async function getActiveTab() {
    const tabs = await new Promise((resolve) =>{
        chrome.tabs.query({active: true, currentWindow: true}, resolve);
    })
    return tabs[0]?.url;    
}

async function remoteCheck(e){
    try{
        const activeTabUrl = await getActiveTab();
        console.log("Active tab url: ", activeTabUrl);
        console.log(e.target);
        e.target.innerText = `R. . .`
        e.target.style ="background-color: #cc99ff;";
        const response = await fetch(`${apiUrl}`,{
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                requestUrl: activeTabUrl
            })
        });
        const responseJson = await response.json()
        console.log("Remote:", responseJson);
        if(response.ok && responseJson.statusCode && !responseJson.requestErr){
            e.target.innerText = `R${responseJson.statusCode}`
            e.target.style ="background-color: #0040ff; color: white;";
        } else if(response.ok && responseJson.statusCode && responseJson.requestErr){
            e.target.innerText = `P${responseJson.statusCode}`
            e.target.style ="background-color: #e67300;";
        } else {
            throw new Error("Bad response.");
        }
    } catch (err){
        console.error("Fetch or badge update failed:", err);
        e.target.innerText = `PErr`;
        e.target.style ="background-color: #cc0000";
    }
}

const autocheckElement = document.getElementById("autocheck");
if (autocheckElement){
    if (options.autocheckRemoute){
        autocheckElement.checked = true;
    }
    autocheckElement.addEventListener("change", (e) =>{
        if(e.target.checked){
            chrome.storage.local.set({autocheckRemoute: true});
        } else{
            chrome.storage.local.set({autocheckRemoute: false});
        }
    })
}

const getIpElement = document.getElementById("getIp");
if (getIpElement){
    if (options.getIp){
        getIpElement.checked = true;
    }
    getIpElement.addEventListener("change", (e) =>{
        if(e.target.checked){
            chrome.storage.local.set({getIp: true});
        } else{
            chrome.storage.local.set({getIp: false});
        }
        location.reload();
    })
}

const checkUrlsElement = document.getElementById("checkUrls");
if (checkUrlsElement){
    if (options.checkUrls){
        checkUrlsElement.checked = true;
    }
    checkUrlsElement.addEventListener("change", (e) =>{
        if(e.target.checked){
            chrome.storage.local.set({checkUrls: true});
        } else{
            chrome.storage.local.set({checkUrls: false});
        }
        location.reload();
    })
}

const remoteCheckButton = document.getElementById("remoteCheck");
if (remoteCheckButton){
    remoteCheckButton.addEventListener("click", remoteCheck);
}

updateIp();
updateUrls();

