import {
  createValidationError,
  removeValidationError,
} from "./validatePatterns.js";

function renderTableHeader($table, keyArray, infoArray) {    
  const $tableHeader = $table.querySelector("thead").querySelector("tr");

  keyArray.forEach((key) => {
    const $tableKeyField = document.createElement("th");

    $tableKeyField.innerHTML = key;
    $tableHeader.append($tableKeyField);
  });

  $tableHeader.addEventListener("click", (event) => {
    if (event.target.closest("th")) {
      const TABLE_USERS_DATA = JSON.parse(
          localStorage.getItem("table_users_data")
        ),
        eventKey = event.target.closest('th').textContent;

      const sortedUsersDataByParam = TABLE_USERS_DATA.toSorted((firstSortedElement, 
        secondSortedElement) => {
          if (typeof firstSortedElement[eventKey] === 'number' 
            && typeof secondSortedElement[eventKey]) {
              return firstSortedElement[eventKey] - secondSortedElement[eventKey];
          }

          return Intl.Collator('en-EN')
            .compare(firstSortedElement[eventKey], secondSortedElement[eventKey]);
      });

      localStorage.setItem("table_users_data", JSON.stringify(sortedUsersDataByParam));
      $table.querySelector('tbody').innerHTML = '';
      renderTableBody($table, infoArray, keyArray);
      window.location.reload();
    }
  });
}

function renderTableBody($table, infoArray, keyArray) {
  infoArray.forEach((userInfoObject) => {
    const $tableBody = $table.querySelector("tbody"),
      $tableUserInfoRow = document.createElement("tr");

    for (let index = 0; index < userInfoObject.length; index++) {
      const userInfo = userInfoObject[index],
        $tableUserInfoField = document.createElement("td");

      if (typeof userInfo === "number") {
        $tableUserInfoField.dataset.numberValue = "";
      }

      $tableUserInfoField.innerHTML = userInfo;
      $tableUserInfoField.dataset.cell = `${keyArray[index]}`;

      $tableUserInfoRow.append($tableUserInfoField);
    }

    $tableBody.append($tableUserInfoRow);
  });
}

function renderAddUserForm($table, keyArray, usersArray) {
  const $controlForm = document.createElement("form");
  $controlForm.setAttribute("name", "addUserTableForm__plugin");
  $controlForm.innerHTML = `
              <fieldset class="p-3 d-flex flex-column">
                  <legend>Добавить пользователя в таблицу</legend>
                  <button type="submit" class="btn btn-primary w-25 mt-3">Добавить</button>
              </fieldset>
          `;

  keyArray.reverse().forEach((key) => {
    const $inputAddUserFieldLabel = document.createElement("label");
    $inputAddUserFieldLabel.className = "fs-3 mt-1 w-75";
    $inputAddUserFieldLabel.innerHTML = `
                  ${key}:
                  <input type="text" data-for="${key}" 
                      class="form-control fw-semibold fs-4" max="20"/>
                  <label class="fs-4 ps-3">
                    Использовать это значение, как число:
                    <input type="checkbox" class="form-check-input"/>
                  </label>
              `;

    if (key === 'id' || key === 'age' || key === 'phone') {
      const $numberCheckboxOn = $inputAddUserFieldLabel.querySelector('input[type="checkbox"]');
      $numberCheckboxOn.setAttribute('checked', '');
    }

    $controlForm.querySelector("legend").after($inputAddUserFieldLabel);
  });

  localStorage.setItem(
    "added_table_users",
    localStorage.getItem("added_table_users")
      ? localStorage.getItem("added_table_users")
      : JSON.stringify([])
  );

  $controlForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const isFormValid = validationAddUserForm(
      $controlForm,
      keyArray
    );

    if (isFormValid) {
      const addUserTableData = {},
        $addUserFormInputs = $controlForm.querySelectorAll('input[type="text"]'),
        TABLE_USERS_DATA = JSON.parse(localStorage.getItem("table_users_data")),
        ADDED_TABLE_USERS_DATA = JSON.parse(
          localStorage.getItem("added_table_users")
        );

      $addUserFormInputs.forEach(($input) => {
        const numberValueCheckboxToggle = $input.parentElement
          .querySelector('input[type="checkbox"]'),
              inputProperty = $input.dataset.for;
        
        if (numberValueCheckboxToggle.checked) {
          return addUserTableData[inputProperty] = Number($input.value);
        }

        return addUserTableData[inputProperty] = $input.value;
      });

      TABLE_USERS_DATA.push({ ...addUserTableData });
      ADDED_TABLE_USERS_DATA.push({ ...addUserTableData });
      localStorage.setItem(
        "table_users_data",
        JSON.stringify(TABLE_USERS_DATA)
      );
      localStorage.setItem(
        "added_table_users",
        JSON.stringify(ADDED_TABLE_USERS_DATA)
      );

      $controlForm.submit();
    }
  });

  $table.before($controlForm);
}

function renderControlForms($table, usersInfoArray) {
  const $removeUserForm = document.createElement("form");
  $removeUserForm.setAttribute("name", "tableRemoveUserForm__plugin");
  $removeUserForm.innerHTML = `
    <fieldset>
      <h2>Удаление пользователя</h2>
      <button type="submit" name="removeUserTableButton__plugin" class="btn btn-danger mt-2">
        Удалить пользователя
      </button>
      <dialog data-type="blocked_deleting_table_modal__plugin" class="w-50 h-25 rounded">
        <h2>Невозможно удалить последний элемент</h2>
        <button data-type="close_modal_button__plugin" class="btn btn-primary w-25">Закрыть</button>
      </dialog>
    </fieldset>
  `;
  $removeUserForm.className = "p-2";

  const $removeUserTableButton = $removeUserForm.querySelector(
    '[name="removeUserTableButton__plugin"]'
  );

  $removeUserTableButton.addEventListener("click", (event) => {
    event.preventDefault();

    if ($removeUserTableButton.dataset.insertMode === "") {
      delete $removeUserTableButton.dataset.insertMode;
    } else {
      $removeUserTableButton.dataset.insertMode = "";
    }

    $removeUserTableButton.innerHTML = "Удалить пользователя";
    delete $table.dataset.deleteMode;

    if ($removeUserTableButton.dataset.insertMode === "") {
      $removeUserTableButton.innerHTML = "Выберите пользователя для удаления";

      $table.dataset.deleteMode = "";
      $table.addEventListener("click", (event) => {
          if (event.target.closest("tr")) {
            const $deletingInfoRow = event.target.closest("tr"),
              deletingRowValues = [],
              TABLE_USERS_DATA = JSON.parse(
                localStorage.getItem("table_users_data")
              ),
              $blockDeletingUserModal = $removeUserForm.querySelector(
                'dialog[data-type="blocked_deleting_table_modal__plugin"]'
              );


            if ($deletingInfoRow.parentElement === $table.querySelector('tbody')) {
              if (TABLE_USERS_DATA.length === 1) {
                delete $table.dataset.deleteMode;
                delete $removeUserTableButton.dataset.insertMode;
                $removeUserTableButton.innerHTML = "Удалить пользователя";
  
                const $closeModalButton = $blockDeletingUserModal.querySelector(
                  'button[data-type="close_modal_button__plugin"]'
                );
  
                $closeModalButton.onclick = (event) => {
                  event.preventDefault();
                  event.target.parentNode.close();
                };
  
                return $blockDeletingUserModal.showModal();
              }

              $deletingInfoRow.querySelectorAll("td").forEach((infoField) => {
                if (infoField.dataset.numberValue === '') {
                  return deletingRowValues.push(Number(infoField.textContent));
                } 
                return deletingRowValues.push(infoField.textContent);
              });
  
              for (let index = 0; index < usersInfoArray.length; index++) {
                if (
                  JSON.stringify(usersInfoArray[index]) ===
                  JSON.stringify(deletingRowValues)
                ) {
                  TABLE_USERS_DATA.splice(index, 1);
                  localStorage.setItem(
                    "table_users_data",
                    JSON.stringify(TABLE_USERS_DATA)
                  );
                }
              }
  
              $deletingInfoRow.remove();
  
              delete $table.dataset.deleteMode;
              delete $removeUserTableButton.dataset.insertMode;
              $removeUserTableButton.innerHTML = "Удалить пользователя";
            }
          }
        },
        { once: true }
      );
    }
  });

  $table.after($removeUserForm);
}

function validationAddUserForm(
  $form,
  keyArray,
  isFormValid = true
) {
  const addUserFormInputs = $form.querySelectorAll('input[type="text"]');

  addUserFormInputs.forEach(($input) => {
    removeValidationError($input);

    if ($input.value === "") {
      isFormValid = false;
      createValidationError($input, "Поле не заполненно");
    }

    if ($input.value.length > Number($input.getAttribute("max"))) {
      isFormValid = false;

      const maxInputLength = $input.getAttribute("max");
      createValidationError(
        $input,
        `Значение поля больше, чем ${maxInputLength}`
      );
    }

    if (keyArray.includes("id") && $input.dataset.for === "id") {
      const tableIdArray = [],
            TABLE_USERS_DATA = JSON.parse(localStorage.getItem('table_users_data'));

      TABLE_USERS_DATA.forEach((userDataObject) => {
        tableIdArray.push(userDataObject.id);
      });

      tableIdArray.forEach((idUser) => {
        if ($input.value === String(idUser)) {
          isFormValid = false;
          createValidationError(
            $input,
            'Идентификатор "id" должен быть уникальным'
          );
        }
      });
    }

    if (keyArray.includes('email') && $input.dataset.for === 'email') {
      const tableEmailArray = [],
            TABLE_USERS_DATA = JSON.parse(localStorage.getItem('table_users_data'));

      TABLE_USERS_DATA.forEach((userDataObject) => {
        tableEmailArray.push(userDataObject.email);
      });

      tableEmailArray.forEach((emailUser) => {
        if ($input.value === String(emailUser)) {
          isFormValid = false;
          createValidationError(
            $input,
            'Идентификатор "email" должен быть уникальным'
          );
        }
      });
    }

    if (keyArray.includes('username') && $input.dataset.for === 'username') {
      const usernameEmailArray = [],
            TABLE_USERS_DATA = JSON.parse(localStorage.getItem('table_users_data'));

      TABLE_USERS_DATA.forEach((userDataObject) => {
        usernameEmailArray.push(userDataObject.username);
      });

      usernameEmailArray.forEach((usernameUser) => {
        if ($input.value === String(usernameUser)) {
          isFormValid = false;
          createValidationError(
            $input,
            'Идентификатор "username" должен быть уникальным'
          );
        }
      });
    }

    if (keyArray.includes('phone') && $input.dataset.for === 'phone') {
      const tablePhoneArray = [],
            TABLE_USERS_DATA = JSON.parse(localStorage.getItem('table_users_data'));

      TABLE_USERS_DATA.forEach((userDataObject) => {
        tablePhoneArray.push(userDataObject.email);
      });

      tablePhoneArray.forEach((phoneUser) => {
        if ($input.value === String(phoneUser)) {
          isFormValid = false;
          createValidationError(
            $input,
            'Идентификатор "phone" должен быть уникальным'
          );
        }
      });
    }

    const emailValidatePattern =
      /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;

    if (
      keyArray.includes("email") &&
      $input.dataset.for === "email" &&
      !$input.value.match(emailValidatePattern)
    ) {
      isFormValid = false;
      createValidationError($input, 'Поле ввода "email" не валидно');
    }
  });

  return isFormValid;
}

export {
  renderTableHeader,
  renderTableBody,
  renderAddUserForm,
  renderControlForms,
};