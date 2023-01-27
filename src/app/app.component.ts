import { Component, OnInit } from '@angular/core';
import { from, Observable, of } from 'rxjs';

//take care of expiration: https://requestmetrics.com/web-performance/http-caching
//take care of attachements in file.service.ts

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private readonly RUNTIME_CACHE = 'runtime-cache';

  title = 'angular-tour-of-heroes';
  public display: string = "init";

  private runtimeCache?: Cache;

  public cachedKeys$?: Observable<any>;

  public messages: string[] = [];

  public startTime:number=0;

  public endTime:number=0;

  public executionTime='';


  async ngOnInit(): Promise<void> {
    // const data: BlobPart = "";
    // const imageBlob = new Blob([data], { type: "image/jpeg" });
    // const imageResponse = new Response(imageBlob);
    // const stringResponse = new Response("Hello world");
    if(!caches.has(this.RUNTIME_CACHE))   {
      const message = 'runtimeCache undefined, creating cache';
      this.messages.push(message);
      console.log(message);
    }
    else {
      const message = `runtime cache ${this.RUNTIME_CACHE} present, opening cache`;
      this.messages.push(message);
      console.log(message);
    }

    this.runtimeCache = await caches.open(this.RUNTIME_CACHE);
    this.cachedKeys$  = from(this.runtimeCache.keys());
  }

  public pushToCache(key:string, value:string)
  {
    if (this.runtimeCache) {
    this.runtimeCache.put(key, new Response(`{"foo": "${value}"}`));
    this.updateDisplaiedValue(key);
    }
    else {
      const message = 'runtimeCache undefined';
      this.messages.push(message);
      console.log(message);
    }
  }

  private async updateDisplaiedValue(key:string)
  {
    let match = await this.runtimeCache?.match(key);
    const resobj = await match?.json();
    this.display = resobj?.foo;
    this.runtimeCache ? this.cachedKeys$  = from(this.runtimeCache.keys()) : null;
  }

  public deleteValueFromCache(key:string)
  {
    this.runtimeCache ? this.runtimeCache.delete(key) : null;
    this.runtimeCache ? this.cachedKeys$  = from(this.runtimeCache.keys()) : null;
  }

  public async deleteCache()
  {
    const deleted = await caches.delete(this.RUNTIME_CACHE)

    if(deleted)
    {
      const message = 'runtimeCache deteled';
      this.messages.push(message);
      console.log(message);
    }
    else
    {
      const message = 'runtimeCache not deleted, didnt exist!';
      this.messages.push(message);
      console.log(message);
    }

    const keys = await this.runtimeCache?.keys();
    //it remains in memmory
    this.runtimeCache ? this.cachedKeys$  = of(keys) : null;
  }

  public addImagesToCache()
  {
    const imageName = 'picture.jfif';
    fetch(imageName)
      .then(
      (response) => {
          if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
              response.status);
          return;
          }

          // Examine the text in the response
          response.blob().then(async imageBlob => {
            // const data: BlobPart = "";
            // const imageBlob = new Blob([data], { type: "image/jpeg" });
            for(let i=1;i<1000;i++) {
            const imageResponse = new Response(imageBlob);
            this.runtimeCache?.put(`${imageName}${i}`, imageResponse);
            }
            this.runtimeCache ? this.cachedKeys$  = from(this.runtimeCache.keys()) : null;
            this.messages.push('images added to cache');


            // Then create a local URL for that image and print it
            // const imageObjectURL = URL.createObjectURL(imageBlob);
            // console.log(imageObjectURL);
        })
      }
      )
      .catch(function(err) {
      console.log('Fetch Error :-S', err);
      });
  }

  public async startPerformanceTest()
  {

    if(this.runtimeCache) {
      this.startTime = Date.now();
      console.log('starttime:' + this.startTime);
      for (const request of await this.runtimeCache.keys()) {
        // if (request.url.endsWith('.png')) {
          let response = await this.runtimeCache.match(request);
        // }
        // const imageBlob = new Blob(response?.body, {type: 'image/jpeg'});
        let blobres = await response?.blob();
        if(blobres) {
        const imageObjectURL = URL.createObjectURL(blobres);

        const image = document.createElement('img')
        image.src = imageObjectURL

        const container = document.getElementById("container")
        container?.append(image)
        }
      }
      this.endTime = Date.now();
      console.log(this.endTime);
      this.executionTime = `Execution time: ${this.endTime - this.startTime} ms`;
      console.log(this.executionTime);
    }
  }

}
