import { Component } from '@angular/core';

@Component({
selector: 'async-banner',
imports: [],
template: `

<div class="container">
    <div class="column">
            <div class="writeup">
                <h2>Manage, Grow, and Promote Your Business Online</h2>
                <p>Harness the power of a digital platform to effectively <span>manage</span> your team,  <span>grow</span> your network, and <span>promote</span> your business.</p>
            </div>
    </div>
</div>

`,
styles: `

/* Create a two-column layout */
.container {
    padding: 3em 0;
    height: 40%;
    .column {
        
        .writeup {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            
            h2 {
                font-weight: bolder;
                font-family: Verdana, Geneva, Tahoma, sans-serif;
                font-size: 3em;
                width: 50%;

            }
            p {
                font-size: 1.5em;
                color: rgb(193, 112, 5);
                font-weight: bolder;
                span {
                    border-bottom: 3px solid rgb(59, 62, 2);
                }
            }
        } 
    }
}

/* Media Query for Mobile Responsiveness */
@media screen and (max-width: 600px) {
.container {
    padding: 2em;
    height: auto;
    .column {
        .writeup {
            h2 {
                font-size: 2em;
                width: 100%;
            }
        }
            
    }
    
}
    
}


/* iPads/tablet (portrait and landscape) */
@media only screen and (min-device-width: 601px) and (max-device-width: 1024px) {
    .container {
        padding: 2em;
        height: auto;
        .column {
            .writeup {
                h2 {
                    font-size: 2em;
                    width: 80%;
                }
            }
            
        }
    }
}

`
})
export class BannerComponent {}
