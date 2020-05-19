import { API_KEY } from './apikey';

const mapsScript = document.createElement('script');
mapsScript.setAttribute('src', `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`);
document.head.appendChild(mapsScript);

const form = document.querySelector('form') as HTMLFormElement;
const addressInput = document.getElementById('address') as HTMLInputElement;

// declare var google: any;

function searchAddressHandler(event: Event) {
    event.preventDefault();
    const enteredAddress = addressInput.value;
    
    interface responseType {
            results: {geometry: {location: {lat: number, lng: number}}}[],
            status: string,
    };

    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(enteredAddress)}&key=${API_KEY}`)
        .then(response => response.json())
        .then((response: responseType) => {
            if (response.status === 'OK') {
                const coordinates = response.results[0].geometry.location;

                const map = new google.maps.Map(document.getElementById('map') as HTMLDivElement, {
                    center: coordinates,
                    zoom: 14
                });

                new google.maps.Marker({position: coordinates, map: map});
            } else {
                throw new Error('Could not fetch location');
            }
        }).catch(error => {
            alert(error.message);
        });

    

    
}

form.addEventListener('submit', searchAddressHandler)