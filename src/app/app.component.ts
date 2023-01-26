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
}
