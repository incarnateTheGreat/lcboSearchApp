document.addEventListener('DOMContentLoaded', () => {
    function lcboAutoCompleteObject() {
      this.acwObject = null;
      this.searchInput = null;
      this.autoCompleteResults = null;
      this.currentSelectedProduct = null;
      this.access_key = 'MDoxMGZmNGI2OC0xOTgwLTExZTctODIzYS1hZjBjOTQxMDg5ZTQ6UDY3T3hsM2NUdlpSOHpoYzJUVlFrODZOUG9obUI5N1NxV2Rp';
      this.selectedAlcoholObject = null;
      this.globalTimeout = null;
      this.loader = document.getElementsByClassName('loader')[0];

      this.createInstance = () => {
        const acw = document.getElementsByClassName('autoCompleteWidget');

        //Instantiate the ACW (AutoComplete Widget) if the DOM does not have an ID associated to it.
        for(let i = 0; i < acw.length; i++) {
          if(acw[i].id === '') {
            acw[i].id = 'acw_' + i;
            this.buildHTMLElements(acw[i].id);
          }
        }
      }
      this.buildHTMLElements = (elemID) => {
        //Establish AutoCompleteWidget Object for this instance.
        this.acwObject = document.getElementById(elemID);

        //Find 'autoCompleteWidget' in DOM to append to.
        const inputAttributes = {
                'type': 'search',
                'name': 'lcboAutoComplete',
                'class': 'lcboAutoCompleteInput',
                'autocomplete': 'off',
                'placeholder': 'Start typing to search for LCBO Alcohol'
              }

        //Add 'alcoholDisplay' table to the DOM.
        this.acwObject.appendChild(document.createElement('input'));

        //Create Input element, then assign attributes.
        this.searchInput = this.acwObject.getElementsByTagName('input')[0];

        for(let key in inputAttributes) {
          this.searchInput.setAttribute(key, inputAttributes[key]);
        }

        //Set On-Focus/On-Blur events to handle Placeholder text.
        this.searchInput.onfocus = function() { this.placeholder = '' }
        this.searchInput.onblur = function() { this.placeholder = 'Start typing to search for LCBO Alcohol' }

        //Create Unordered List for AutoComplete, then assign attributes.
        this.acwObject.appendChild(document.createElement('ul'));
        this.acwObject.getElementsByTagName('ul')[0].setAttribute('class', 'lcboAutoComplete');

        //Create left and right containers
        let leftContainer = document.createElement('div'),
            rightContainer = document.createElement('div');

        leftContainer.className = 'acw_left';
        rightContainer.className = 'acw_right';

        this.acwObject.appendChild(leftContainer);
        this.acwObject.appendChild(rightContainer);

        //Create Image Thumbnail element, then assign attributes.
        let imageElem = document.createElement('img');
        imageElem.src = '';
        imageElem.alt = '';
        imageElem.title = '';

        //Append the image to the Left Container.
        this.acwObject.getElementsByClassName('acw_left')[0].appendChild(imageElem);

        //Create Table for results, then assign attributes
        const productTableElem = document.createElement('table'),
            tableElem = document.createElement('table');
            acw_right = this.acwObject.getElementsByClassName('acw_right')[0];

        productTableElem.className = 'productData';
        tableElem.className = 'alcoholDisplay';

        //Append the Tables to the Right Container.
        acw_right.appendChild(productTableElem);
        acw_right.appendChild(tableElem);

        this.declare();
      };

      this.declare = () => {
        const alcoholInput = this.acwObject.getElementsByClassName('lcboAutoCompleteInput')[0],
              alcoholImg = this.acwObject.getElementsByTagName('img')[0],
              alcoholTable = this.acwObject.getElementsByClassName('alcoholDisplay')[0],
              alcoholProductTable = this.acwObject.getElementsByClassName('productData')[0],
              url = 'http://lcboapi.com/products?access_key=' + this.access_key + '&q=';

        const autocompleteList = this.acwObject.getElementsByClassName('lcboAutoComplete')[0];

        //Listen for any text or option selection input.
        alcoholInput.addEventListener('keyup', (e) => {
          const input = e.target,
              inputType = e.inputType,
              timeoutVal = 0,
              val = input.value;

              //Clear the Alcohol Table and do not call the LCBO API.
              if(val === '') {
                autocompleteList.innerHTML = '';
                document.onkeydown = null;
                return false;
              }

              //Sets a delay for the user to complete typing their query in.
              //Designed to avoid numerous calls to the service.
              if (this.globalTimeout != null) {
                clearTimeout(this.globalTimeout);
              }
              this.globalTimeout = setTimeout(function() {
                this.globalTimeout = null;

                //Set API request data.
                const request = new Request(url + val);

                //On request, collect the JSON data, deliver it, and then populate the AutoComplete system.
                fetch(request)
                  .then((response) => response.json())
                  .then((data) => {
                    populateAutoComplete(data.result);
                  }).catch((err) => { console.log(err) }
                );
              }, 500);
        });

        //Populate AutoComplete List.
        const populateAutoComplete = (result) => {
          let options = '';

          this.autoCompleteResults = result;

          //Create Options tags for the Datalist and then insert it into the DOM.
          this.autoCompleteResults.forEach((obj, i) => {
            options += '<li data-package="' + obj.package
                    + '" data-id="' + obj.id
                    + '" value="' + obj.name
                    + '" tabindex=1>' + obj.name + ' ' + obj.package + '</li>';
          })

          autocompleteList.innerHTML = options;

          //When an element is clicked, send out the data to be rendered on the screen and clear the searchr results.
          if(this.autoCompleteResults.length > 0) {
            autocompleteList.addEventListener('click', (e) => {
              renderSelection(e);
              document.onkeydown = null;
            });

            const first = autocompleteList.firstChild,
                  last = autocompleteList.lastChild,
                  mainInput = this.searchInput;

            document.onkeydown = function(e) {
              //Temporarily deactivates the Arrow keys and Space Bar.
              if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                  e.preventDefault();
              }

              switch (e.keyCode) {
                case 38: // If the UP key is pressed
                  //Prevents from going out of bounds.
                  if(document.activeElement.previousSibling === null) break;

                  //Moves the focus to the previous sibling.
                  if (document.activeElement == mainInput) {
                    last.previousSibling.focus();
                  } else {
                    document.activeElement.previousSibling.focus();
                  }

                  break;
                case 40: // If the DOWN key is pressed
                  //Prevents from going out of bounds.
                  if(document.activeElement.nextSibling === null) break;

                  //Moves the focus to the previous sibling.
                  if (document.activeElement == mainInput) {
                    first.focus();
                  } else {
                    document.activeElement.nextSibling.focus();
                  }

                  break;
                case 13:
                  //Submit by hitting Enter.
                  renderSelection(e);
                  break;
              }
            }
          }

          function renderSelection(e) {
            renderSelectedAlcoholObject(e.target);
            alcoholInput.value = e.target.getAttribute('value') + ' ' + e.target.getAttribute('data-package');
            autocompleteList.innerHTML = '';
          };
        }

        //Render the Selected Alcohol JSON data.
        const renderSelectedAlcoholObject = (selectedAlcoholObject) => {
          this.selectedAlcoholObject = selectedAlcoholObject;

          //Prevents reload of the currently-selected Product.
          if(this.selectedAlcoholObject.getAttribute('data-id') == this.currentSelectedProduct) return;

          this.showLoader();
          this.hideACWData();

          //Get Stores Info for Product
          const url = 'http://lcboapi.com/products/' + this.selectedAlcoholObject.getAttribute('data-id') + '/inventory?access_key=' + this.access_key,
                request = new Request(url);

          //On request, collect the JSON data, deliver it, and then populate the AutoComplete system.
          fetch(request)
            .then((response) => response.json())
            .then((data) => {
              this.getStoreData(data.result, false, function(productStoreData, pagerData) {
                this.drawTable(productStoreData, pagerData);
              })
            }).catch((err) => { console.log(err) }
          );
        }

        //Draw the Table.
        this.drawTable = (productStoreData, pagerData) => {
          let productTable = '',
              table = '',
              selectedAlcoholObject = '',
              paginationButton = null,
              buttonText = null;

          //Find and identify the Selected Alcohol option.
          for(let x in this.autoCompleteResults) {
            if ((this.autoCompleteResults.hasOwnProperty(x)) &&
                (parseFloat(this.selectedAlcoholObject.getAttribute('data-id')) === this.autoCompleteResults[x].id)) {
                  selectedAlcoholObject = this.autoCompleteResults[x];
              break;
            }
          }

          //Build the Seleced Alcohol Product Table and insert it into the DOM.
          productTable += '<tr><th>Toronto Product Store Data</th><th class="pagination"></th></tr>';

          //Sort store names alphabetically.
          // productStoreData.sort(function (a, b) {
          //   var nameA = a.name.toUpperCase(); // ignore upper and lowercase
          //   var nameB = b.name.toUpperCase(); // ignore upper and lowercase
          //   if (nameA < nameB) {
          //     return -1;
          //   }
          //   if (nameA > nameB) {
          //     return 1;
          //   }
          //
          //   // names must be equal
          //   return 0;
          // });

          productTable += '<tr>';
            productTable += '<td>Price</td>';
            productTable += '<td class="quantity">$' + (selectedAlcoholObject['price_in_cents'] / 100).toFixed(2) + '</td>';
          productTable += '</tr>';

          if(selectedAlcoholObject !== null) {
            for(let z in productStoreData) {
              productTable += '<tr>';
                productTable += '<td class="storeName">' + productStoreData[z].name + '</td>';
                productTable += '<td class="quantity">' + productStoreData[z].quantity + '</td>';
              productTable += '</tr>'
            }

            //Build the Seleced Alcohol JSON Data Table and insert it into the DOM.
            table += '<tr><th>Product JSON Data</th></tr>';

            for(let y in selectedAlcoholObject) {
              table += '<tr>';
                table += '<td class="key">' + y + '</td>';
                table += '<td class="value">' + selectedAlcoholObject[y] + '</td>';
              table += '</tr>'
            }

            this.currentSelectedProduct = selectedAlcoholObject.id;
          } else {
            table = '<tr><td>Sorry. No available selection.</td></tr>';
          }

          //Do not display any image data if there is none.
          if(selectedAlcoholObject.image_thumb_url !== null) {
            alcoholImg.src = selectedAlcoholObject.image_url;
            alcoholImg.alt = selectedAlcoholObject.name + ': ' + selectedAlcoholObject.package;
            alcoholImg.title = selectedAlcoholObject.name + ': ' + selectedAlcoholObject.package;
          } else {
            alcoholImg.src = './images/noImage.jpg';
            alcoholImg.alt = '';
            alcoholImg.title = '';
          }

          //Send the data to the Alcohol Table and display it.
          alcoholTable.innerHTML = table;
          alcoholProductTable.innerHTML = productTable;

          //Draw Pagination Buttons.
          if(pagerData.total_pages > 1) {
            for(let i = 1; i < pagerData.total_pages + 1; i++) {
              paginationButton = document.createElement('button');
              paginationButton.setAttribute('data-pageID', i);
              buttonText = document.createTextNode(i);
              paginationButton.appendChild(buttonText);

              paginationButton.addEventListener('click', (e) => {
              //   // for(let j = 0; j < document.querySelectorAll('.pagination button').length; j++) {
              //   //   document.querySelectorAll('.pagination button')[j].className = '';
              //   // }
              //
              //   e.target.className = 'selectedPage';
              //   console.log(e);
                if(i > 0) {
                  this.getStoreData(pagerData, true, i);
                }
              })

              this.acwObject.getElementsByClassName('pagination')[0].appendChild(paginationButton);
            }
          }

          setTimeout(() => {
            this.hideLoader();
            this.showACWData();
          }, 1000);
        }
      }

      this.getStoreData = (productData, isPagination, pageNumber) => {
        let url = '';

        //Determine if call is from pagination or init load.
        if(isPagination && typeof pageNumber === 'number') {
          //Prevents unnecessary calls to the API if the same page is being rendered.
          if(productData.current_page === pageNumber) return;

          this.showLoader();

          const index = productData.current_page_path.lastIndexOf('='),
              path = productData.current_page_path.substring(0, index + 1);
          url = 'http://lcboapi.com' + path + pageNumber;
        } else {
          url = 'http://lcboapi.com/products/'
                + productData[0].product_id + '/stores?order=id&access_key=' + this.access_key + '&q=Toronto&per_page=50';
        }
        //Get Stores Info for Product
        const request = new Request(url);

        //On request, collect the JSON data, deliver it, and then populate the AutoComplete system.
        fetch(request)
          .then((response) => response.json())
          .then((data) => {
            this.drawTable(data.result, data.pager);
          });
      }

      //Show and Hide ACW data
      this.showACWData = () => {
        this.acwObject.getElementsByClassName('acw_left')[0].style.opacity = '1';
        this.acwObject.getElementsByClassName('acw_right')[0].style.opacity = '1';
      }
      this.hideACWData = () => {
        this.acwObject.getElementsByClassName('acw_left')[0].style.opacity = '0';
        this.acwObject.getElementsByClassName('acw_right')[0].style.opacity = '0';
      }

      //Show and Hide Load Spinner
      this.showLoader = () => {
        this.loader.style.opacity = '1';
      }
      this.hideLoader = () => {
        this.loader.style.opacity = '0';
      }

      //Begin instantiaion process.
      this.createInstance();
    };

    const acw = new lcboAutoCompleteObject();
});
