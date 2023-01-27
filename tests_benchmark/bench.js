
(async () => {

    runtimeCache = await caches.open('runtime-cache');

    let timeStarted;

    let timeEnded;

    debugger;

    const imageName = 'http://127.0.0.1:4200/picture.jfif';
      fetch(imageName)
        .then(
        (response) => {
            if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
                response.status);
            return;
            }

            response.blob().then(async imageBlob => {
              for(let i=1;i<1000;i++) {
              const imageResponse = new Response(imageBlob);
              runtimeCache?.put(`${imageName}${i}`, imageResponse);
              }
          })
        }
        )
        .catch(function(err) {
        console.log('Fetch Error :-S', err);
        });

    const suite = new Benchmark.Suite('foo');

    let i = 0

    suite
    .add('renderImagesFromCache',{ defer: true, fn: async (deferred) => {

        if(runtimeCache) {


          timeStarted = Date.now();
          console.log(i++ + ':' + timeStarted);
          let keys = await runtimeCache.keys();
          for (const request of keys) {
              let response = await runtimeCache.match(request);
            // }
            let blobres = await response?.blob();
            if(blobres) {
            const imageObjectURL = URL.createObjectURL(blobres);

            const image = document.createElement('img')
            image.src = imageObjectURL

            const container = document.getElementById("container")
            container?.append(image)
            }
          }
          deferred.resolve();

        }
      },
      // setup: async (deferred) => {
      //   timeStarted = Date.now();
      //   deferred.resolve();
      // },
      // teardown: () => {
      //   console.log(`Execution time: ${Date.now() - timeStarted} ms`);
      // }
      })
      .on('cycle', event => {
          const benchmark = event.target;

          console.log(benchmark.toString());

      })
      // .on('setup', event => {
      //   timeStarted = Date.now();

      //   console.log(benchmark.toString());
      // })
      // .on('teardown', event => {
      //   console.log(`Execution time: ${Date.now() - timeStarted} ms`);
      // })

      suite.on('complete', event => {
        console.log(Date.now());
        console.log(`Execution time: ${Date.now() - timeStarted} ms`);
      const suite = event.currentTarget;

      const fastestOption = suite.filter('fastest').map('name');
      console.log(`The fastest option is ${fastestOption}`);
    })
      .run({ async: true });

  })();
