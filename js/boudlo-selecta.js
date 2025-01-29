document.addEventListener("DOMContentLoaded", (event) => {
  let multiSelectors = document.querySelectorAll('[data-boudlo-selecta]');
  // console.log(multiSelectors);
  let multiSelectorArr = [...multiSelectors]; // converts NodeList to Array
  
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
    wrapper.appendChild(dropSelect);
    
    let fakeTagInput = document.createElement("input");
    fakeTagInput.id = originalSelector.id + "_bds_fakeTagInput";
    fakeTagInput.classList.add("bds_fakeTagInput");
    dropSelect.prepend(fakeTagInput);

    var width = fakeTagInput.offsetWidth;
    var height = fakeTagInput.offsetHeight;
    wrapper.style.height = height + 'px';

    let displayBox = document.createElement("div");
    displayBox.id = originalSelector.id + "_bds_displaybox";
    displayBox.classList.add("bds_displaybox");
    displayBox.style.height = height + 'px';
    displayBox.style.width = width + 'px';
    wrapper.prepend(displayBox);

    displayBox.addEventListener("click", (click) => {
      triggerFocus(fakeTagInput);
    });

    fakeTagInput.addEventListener("focus", (focus) => {
      dropSelect.classList.remove("closed");
      dropSelect.classList.add("open");
    });
    
    fakeTagInput.addEventListener("blur", (blur) => {
      dropSelect.classList.remove("open");
      dropSelect.classList.add("closed");
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
          let tag = document.createElement('span');
          tag.setAttribute('data-bds-value', option.value);
          tag.setAttribute('data-bds-label', option.label);
          tag.innerHTML = option.label;
          displayBox.appendChild(tag);
          fakeTagInput.placeholder = '';
        }

        // Add the mousedown event that adds the tag
        divOption.addEventListener("mousedown", (mousedown) => {
          if(option.hasAttribute('selected')) {
            option.removeAttribute("selected");
            mousedown.target.classList.remove('selected');
            let clearElements = document.querySelectorAll('#' + originalSelector.id + "_bds_displaybox > [data-bds-value='" + option.value + "']");
            let tagsToClear = [...clearElements];
            console.log(tagsToClear);
            tagsToClear.forEach((tag) => tag.remove());
          } else {
            option.setAttribute("selected", "selected");
            mousedown.target.classList.add('selected');
            let tag = document.createElement('span');
            tag.setAttribute('data-bds-value', option.value);
            tag.setAttribute('data-bds-label', option.label);
            tag.innerHTML = option.label;
            displayBox.appendChild(tag);
          }

          if(displayBox.childElementCount) {
            fakeTagInput.placeholder = '';
          }
        });

        divOption.innerHTML = option.label;
        dropSelect.appendChild(divOption);
      }
    });
  }

  function triggerFocus(element) {
    let eventType = "onfocusin" in element ? "focusin" : "focus";
    let bubbles = "onfocusin" in element;
    let event;

    if ("createEvent" in document) {
        event = document.createEvent("Event");
        event.initEvent(eventType, bubbles, true);
    }
    else if ("Event" in window) {
        event = new Event(eventType, { bubbles: bubbles, cancelable: true });
    }

    element.focus();
    element.dispatchEvent(event);
  }
});
