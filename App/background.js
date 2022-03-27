const CLIENT_ID = encodeURIComponent('044a52e2014041bb863efdb43a4e8392');
const RESPONSE_TYPE = encodeURIComponent('token');
const REDIRECT_URI = encodeURIComponent('https://pgcklffgbeegpjejohlcfengdiblgipj.chromiumapp.org/');
const SCOPE = encodeURIComponent('user-read-email');
const SHOW_DIALOG = encodeURIComponent('true'); 
const apiUrl = "https://api.spotify.com/v1";
let STATE = '';
let ACCESS_TOKEN = '';
let regexSearch = /\bsearch-\b(.*)$/;
let user_signed_in = false;

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

    console.log(oauth2_url);

    return oauth2_url;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request.message);
    if (request.message === 'login') {
        if (user_signed_in) {
            console.log("User is already signed in.");
        } else {
            logInWithSpotify(sendResponse);
        }
      
      return true;
    } else if (request.message === 'logout') {
        user_signed_in = false;
        chrome.browserAction.setPopup({ popup: './popup.html' }, () => {
            sendResponse({ message: 'success' });
        });

        return true;
    }else if(request.message.match(regexSearch)){
        const match = request.message.match(regexSearch);
        searchForArtist(match[1]);
        sendResponse({ message: 'test'});
        
    }
});


function logInWithSpotify(sendResponse){
    chrome.identity.launchWebAuthFlow({
        url: create_spotify_endpoint(),
        interactive: true
    }, function (redirect_url) {
        if (chrome.runtime.lastError) {
            sendResponse({ message: 'fail' });
        } else {
            if (redirect_url.includes('callback?error=access_denied')) {
                sendResponse({ message: 'fail' });
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
                        sendResponse({ message: 'success' });
                    });
                    console.log(ACCESS_TOKEN)
                } else {
                    sendResponse({ message: 'fail' });
                }
            }
        }
    });
}


async function searchForArtist(query){
    const searchResult = await fetch(`${apiUrl}/search?query=${query}&type=artist&market=FR&locale=fr-FR%2Cfr%3Bq%3D0.9%2Cen-US%3Bq%3D0.8%2Cen%3Bq%3D0.7%2Ces%3Bq%3D0.6&offset=0&limit=5&access_token=${ACCESS_TOKEN}`);
    const data = await searchResult.json();
    console.log(data);
    let artists = [];
    for(let i = 0; i < data.artists.items.length; i++){
        artists.push(data.artists.items[i].name);
       
    }
    return artists;
    
}
