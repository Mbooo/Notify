

const CLIENT_ID = encodeURIComponent('044a52e2014041bb863efdb43a4e8392');
const RESPONSE_TYPE = encodeURIComponent('token');
const REDIRECT_URI = encodeURIComponent('https://pgcklffgbeegpjejohlcfengdiblgipj.chromiumapp.org/');
const SCOPE = encodeURIComponent('user-read-email user-follow-read user-follow-modify');
const SHOW_DIALOG = encodeURIComponent('true'); 
const apiUrl = "https://api.spotify.com/v1";
const bg = chrome.extension.getBackgroundPage();
let STATE = '';
let ACCESS_TOKEN = '';
let regexSearch = /\bsearch-\b(.*)$/;
let user_signed_in = false;


window.onload = function(){
    let button_sign_in = document.getElementById("sign-in");
    if(button_sign_in){
        button_sign_in.addEventListener("click",function(){
            if(user_signed_in)
                console.log("L'utilisateur est déjà connecté");
            else{
                logInWithSpotify();
            }
        });
    }
    let button_sign_out = document.getElementById("sign-out");
    if(button_sign_out){
        button_sign_out.addEventListener("click",logout);
    }

    let search_bar_form = document.getElementById("search-bar");
    if(search_bar_form){
        function handleForm(event){ event.preventDefault(); searchForArtist()}
        search_bar_form.addEventListener("submit",handleForm);
    }
    let search_button = document.getElementById("search-tab");
    let notification_button = document.getElementById("notifications-tab");

    if(search_button){
        search_button.addEventListener("click",function(){
            notification_button.classList.remove("active");
            document.getElementById("notifications-tab-content").classList.remove("active");
            search_button.classList.add("active");
            document.getElementById("search-tab-content").classList.add("active");

        });
    }

    if(notification_button){
        notification_button.addEventListener("click",function(){
            updateNotifications();
            search_button.classList.remove("active");
            document.getElementById("search-tab-content").classList.remove("active");
            notification_button.classList.add("active");
            document.getElementById("notifications-tab-content").classList.add("active");
            
        });
    }
    
    
   
    
}

function follow(){
    alert("aaa");
}
function create_spotify_endpoint() {
    
    STATE = encodeURIComponent('meet' + Math.random().toString(36).substring(2, 15));

    let oauth2_url =
        `https://accounts.spotify.com/authorize
?client_id=${CLIENT_ID}
&response_type=${RESPONSE_TYPE}
&redirect_uri=${REDIRECT_URI}
&state=${STATE}
&scope=${SCOPE}
&show_dialog=${SHOW_DIALOG}
`;

    bg.console.log(oauth2_url);

    return oauth2_url;
}


// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     console.log(request.message);
    
//     else if(request.message === 'notification'){
//         updateNotifications();
//         return true;
//     }
// });

function logout(){
    user_signed_in = false;
    chrome.browserAction.setPopup({ popup: './popup.html' }, () => {
        window.close();
    });
}

function logInWithSpotify(){
    chrome.identity.launchWebAuthFlow({
        url: create_spotify_endpoint(),
        interactive: true
    }, function (redirect_url) {
        if (chrome.runtime.lastError) {
            bg.console.log("Erreur : " + chrome.runtime.lastError);
        } else {
            if (redirect_url.includes('callback?error=access_denied')) {
                bg.console.log("Erreur redirect url");
            } else {
                ACCESS_TOKEN = redirect_url.substring(redirect_url.indexOf('access_token=') + 13);
                ACCESS_TOKEN = ACCESS_TOKEN.substring(0, ACCESS_TOKEN.indexOf('&'));
                let state = redirect_url.substring(redirect_url.indexOf('state=') + 6);

                if (state === STATE) {
                    console.log("SUCCESS")
                    user_signed_in = true;

                    setTimeout(() => {
                        ACCESS_TOKEN = '';
                        user_signed_in = false;
                    }, 3600000);

                    chrome.browserAction.setPopup({ popup: './popup-signed-in.html' }, () => {
                        window.close();
                    });
                    bg.console.log(ACCESS_TOKEN);
                } else {
                    bg.console.log("Erreur");
                }
            }
        }
    });
}

async function follow(id){
    const query = await fetch(`${apiUrl}/me/following&type=artist&id=${id}&access_token=${ACCESS_TOKEN}`,{method: 'PUT'});

}
async function searchForArtist(){
   document.getElementById("results").innerHTML = ""
   let input_search = document.getElementById("input-search").value.trim();
   
    const searchResult = await fetch(`${apiUrl}/search?query=${input_search}&type=artist&market=FR&locale=fr-FR%2Cfr%3Bq%3D0.9%2Cen-US%3Bq%3D0.8%2Cen%3Bq%3D0.7%2Ces%3Bq%3D0.6&offset=0&limit=3&access_token=${ACCESS_TOKEN}`);
    const data = await searchResult.json();
    bg.console.log(data);
    let artists = [];
    for(let i = 0; i < data.artists.items.length; i++){
        artists.push(data.artists.items[i].name);
        let div_card = document.createElement("div");
        div_card.classList.add("ui","cards");
        
        let card = document.createElement("div");
        card.classList.add("card");
        let div_content = document.createElement("div");
        div_content.classList.add("content");
        
        let header = document.createElement("div");
        header.classList.add("header");
        header.appendChild(document.createTextNode(data.artists.items[i].name));

        let description = document.createElement("div");
        description.classList.add("description");
        description.appendChild(document.createTextNode("Followers  : " + data.artists.items[i].followers.total));

        div_content.appendChild(header);
        div_content.appendChild(description);
        card.appendChild(div_content);
        div_card.appendChild(card);
        
        let button = document.createElement("div");
        button.classList.add("ui","bottom","attached","button","follow");
        button.id = i;
        let icon = document.createElement("i");
        icon.classList.add("add","icon");
        button.appendChild(icon);

        button.addEventListener("click",function(){
            follow(data.artists.items[i].id);
        })
        card.appendChild(button);
        document.getElementById("results").appendChild(div_card);
    }
    return artists;
    
}

async function updateNotifications(){
    const artistsFollowed = await fetch(`${apiUrl}/me/following?type=artist&access_token=${ACCESS_TOKEN}`);
    const dataArtists = await artistsFollowed.json();
    let artistsId = [];
   
    bg.console.log(dataArtists);
    for(let i = 0; i < dataArtists.artists.items.length;i++){
        artistsId.push(dataArtists.artists.items[i].id);
    }
    
    let tracks = [];
    for(let y = 0; y < artistsId.length; y++){
        const tracks = await fetch(`${apiUrl}/artists/${artistsId[y]}/albums?offset=0&limit=2&include_groups=single&market=FR&locale=fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6&access_token=${ACCESS_TOKEN}`);
        const dataTracks = await tracks.json();
        bg.console.log(dataTracks);
        for(let i = 0; i < dataTracks.items.length; i++){
            let link = document.createElement("a");
            link.href = dataTracks.items[i].external_urls.spotify;
            
            let div_card = document.createElement("div");
            div_card.classList.add("ui","cards");
            
            let card = document.createElement("div");
            card.classList.add("card");
            let div_content = document.createElement("div");
            div_content.classList.add("content");
            let description = document.createElement("div");
        description.classList.add("description");
        description.appendChild(document.createTextNode("Artiste  : " + dataTracks.items[i].artists[0].name));

            let header = document.createElement("div");
            header.classList.add("header");
            header.appendChild(document.createTextNode(dataTracks.items[i].name));
                
    
            div_content.appendChild(header);
            div_content.appendChild(description);
            card.appendChild(div_content);
            div_card.appendChild(card);
            link.append(div_card);
            document.getElementById("resultsNotif").appendChild(link);
        }
        
        
    }
    bg.console.log(tracks);
    
    
}



