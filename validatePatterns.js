function createValidationError($input, errorMessage) {
  const $inputLabel = $input.parentNode;
  $inputLabel.dataset.error = '';

  $inputLabel.classList.add('border');
  $inputLabel.classList.add('border-danger');
  $inputLabel.classList.add('p-2');

  const $errorContainer = document.createElement('span');
  $errorContainer.className = 'p-2';
  $errorContainer.dataset.type = 'container-error';
  $errorContainer.textContent = errorMessage;

  $inputLabel.append($errorContainer);
}

function removeValidationError($input) {
  const $inputLabel = $input.parentNode;
  
  if ($inputLabel.dataset.error === '') {
      delete $inputLabel.dataset.error;
      
      $inputLabel.classList.remove('border');
      $inputLabel.classList.remove('border-danger');
      $inputLabel.classList.remove('p-2');

      $inputLabel.querySelectorAll('span[data-type="container-error"]')
          .forEach(errorContainer => {
              errorContainer.remove();
          });
  }
}

export { createValidationError, removeValidationError};