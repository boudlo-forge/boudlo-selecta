let bdsInputClassOverride = 'form-control';

document.addEventListener("DOMContentLoaded", (event) => {

  let multiSelectors = document.querySelectorAll('[data-boudlo-selecta]');
  // console.log(multiSelectors);
  let multiSelectorArr = [...multiSelectors]; // converts NodeList to Array

  let multiSelectMask = document.createElement('div');
  multiSelectMask.classList.add('bds_multiselect_mask');
  document.body.prepend(multiSelectMask);
  
  multiSelectorArr.forEach(originalSelector => {
		processOptions(originalSelector);

    // Options for the observer (which mutations to observe)
    const config = { childList: true };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList") {
          console.log('options changed.');
          processOptions(originalSelector);
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(originalSelector, config);
  });

  function processOptions(originalSelector) {

    let wrapperId = originalSelector.id + "_bds_wrapper";
    let oldWrapper = document.getElementById(wrapperId);

    if(oldWrapper && typeof oldWrapper !== 'undefined') {
      oldWrapper.parentNode.insertBefore(originalSelector, oldWrapper);
      oldWrapper.remove();
    }

    let wrapper = document.createElement("div");

    wrapper.id = originalSelector.id + "_bds_wrapper";
    wrapper.classList.add("bds_wrapper");
    originalSelector.parentNode.insertBefore(wrapper, originalSelector);
    wrapper.appendChild(originalSelector);
    
    originalSelector.style.display = "none";
    
    let dropSelect = document.createElement("div");
    dropSelect.id = originalSelector.id + "_bds_dropselect";
    dropSelect.classList.add("bds_dropselect");
    dropSelect.classList.add("closed");
    wrapper.prepend(dropSelect);
    
    let fakeTagInput = document.createElement("input");
    fakeTagInput.id = originalSelector.id + "_bds_fakeTagInput";
    fakeTagInput.classList.add("bds_fakeTagInput");

    if(typeof bdsInputClassOverride === 'string') {
      fakeTagInput.classList.add(bdsInputClassOverride);
    }

    wrapper.prepend(fakeTagInput);

    let displayBox = document.createElement("div");
    displayBox.id = originalSelector.id + "_bds_displaybox";
    displayBox.classList.add("bds_displaybox");
    dropSelect.prepend(displayBox);

    let opener = document.createElement('div');
    opener.id = originalSelector.id + "_bds_opener";
    opener.classList.add("bds_opener");
    dropSelect.appendChild(opener);

    let optionWrapper = document.createElement('div');
    optionWrapper.id = originalSelector.id + "_bds_optionwrapper";
    optionWrapper.classList.add("bds_optionwrapper");
    dropSelect.appendChild(optionWrapper);

    opener.addEventListener("click", (click) => {
      hideAll();
      dropSelect.classList.remove("closed");
      dropSelect.classList.add("open");
      multiSelectMask.style.display = 'block';
    });
    
    multiSelectMask.addEventListener("click", (click) => {
      dropSelect.classList.remove("open");
      dropSelect.classList.add("closed");
      click.target.style.display = 'none';
    });

    let options = [...originalSelector.options];
    let i=0;

    options.forEach(option => {
      i++;
      let divOption = document.createElement("div");

      divOption.classList.add('bds_option');
      divOption.setAttribute('data-bds-value', option.value);
      divOption.setAttribute('data-bds-label', option.label);

      // if first option is disabled and selected assume it is a placeholder label
      if(i==1 && option.disabled && option.selected) {

        fakeTagInput.placeholder = option.label;

      } else {

        // Select any that should be selected and add the tag
        if(option.hasAttribute('selected')) {
          divOption.classList.add('selected');
          let tag = document.createElement('div');
          tag.setAttribute('data-bds-value', option.value);
          tag.setAttribute('data-bds-label', option.label);
          tag.innerHTML = option.label;

          let closer = createCloser(originalSelector, option, divOption);
          tag.appendChild(closer);

          displayBox.appendChild(tag);
          fakeTagInput.placeholder = '';
        }

        // Add the mousedown event that adds the tag
        divOption.addEventListener("click", (click) => {
          if(option.hasAttribute('selected')) {
            option.removeAttribute("selected");
            click.target.classList.remove('selected');
            let clearElements = document.querySelectorAll('#' + originalSelector.id + "_bds_displaybox > [data-bds-value='" + option.value + "']");
            let tagsToClear = [...clearElements];
            console.log(tagsToClear);
            tagsToClear.forEach((tag) => tag.remove());
          } else {
            option.setAttribute("selected", "selected");
            click.target.classList.add('selected');
            let tag = document.createElement('div');
            tag.setAttribute('data-bds-value', option.value);
            tag.setAttribute('data-bds-label', option.label);
            tag.innerHTML = option.label;

            let closer = createCloser(originalSelector, option, divOption);
            tag.appendChild(closer);

            displayBox.appendChild(tag);
          }

          if(displayBox.childElementCount) {
            fakeTagInput.placeholder = '';
          }
        });

        divOption.innerHTML = option.label;
        optionWrapper.appendChild(divOption);
      }
    });
  }

  resizeItAll();
  window.onresize = resizeItAll;

  function hideAll() {
    let multiSelectors = document.querySelectorAll('[data-boudlo-selecta]');
    // console.log(multiSelectors);
    let multiSelectorArr = [...multiSelectors]; // converts NodeList to Array

    multiSelectorArr.forEach(selector => {
      let dropSelect = document.getElementById(selector.id + "_bds_dropselect");
      if(dropSelect && typeof dropSelect !== 'undefined') {
        dropSelect.classList.remove("open");
        dropSelect.classList.add("closed");
      }
    });
  }

  function createCloser(selector, option, divOption) {
    let closer = document.createElement('span');
    closer.classList.add('closer');
    closer.addEventListener("click", (click) => {
      option.removeAttribute("selected");
      divOption.classList.remove('selected');
      let clearElements = document.querySelectorAll('#' + selector.id + "_bds_displaybox > [data-bds-value='" + option.value + "']");
      let tagsToClear = [...clearElements];
      console.log(tagsToClear);
      tagsToClear.forEach((tag) => tag.remove());
    });

    closer.innerHTML = '&#x2715;';

    return closer;
  }

  function resizeItAll() {

    let selectors = document.querySelectorAll('.bds_wrapper');
    // console.log(multiSelectors);
    let selectorArr = [...selectors]; // converts NodeList to Array

    selectorArr.forEach(selector => {

      let fakeTagInput = selector.querySelector('.bds_fakeTagInput');
      
      if(fakeTagInput && typeof fakeTagInput !== 'undefined') {
        let width = fakeTagInput.offsetWidth;
        let height = fakeTagInput.offsetHeight;

        selector.style.height = height + 'px';

        let displayBox = selector.querySelector('.bds_displaybox');

        if(displayBox && typeof displayBox !== 'undefined') {
          displayBox.style.height = height + 'px';
          displayBox.style.width = width + 'px';
        }


        let dropSelect = selector.querySelector('.bds_dropselect');

        if(dropSelect && typeof dropSelect !== 'undefined') {
          dropSelect.style.height = height + 'px';
        }

        let optionWrapper = selector.querySelector('.bds_optionwrapper');

        if(optionWrapper && typeof optionWrapper !== 'undefined') {
          optionWrapper.style.top = height + 'px';
        }

        let opener = selector.querySelector('.bds_opener');

        if(opener && typeof opener !== 'undefined') {
          opener.style.height = height + 'px';
          opener.style.width = width + 'px';
        }
      }
    });
  }
});
