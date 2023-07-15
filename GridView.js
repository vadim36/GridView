import { renderTableHeader, renderTableBody, renderAddUserForm, renderControlForms } from "./renderTableMethods.js";

export class GridView {
  constructor(
    receivedUsersData,
    insertElement,
    {
      tableClassName = "table table-success table-striped-columns border-success border",
    } = {}
  ) {
    this.usersData = receivedUsersData;
    this.tableClass = tableClassName;

    this.#render(insertElement);
  }

  #render(insertElement) {
    const $createdTable = document.createElement("table");
    $createdTable.className = this.tableClass;
    $createdTable.dataset.type = "users-table";
    $createdTable.innerHTML = `
                <thead>
                    <tr></tr>
                </thead>
                <tbody></tbody>
            `;

    renderTableHeader($createdTable, this.usersKey, this.usersInfo);
    renderTableBody($createdTable, this.usersInfo, this.usersKey);

    insertElement.append($createdTable);
    renderAddUserForm($createdTable, this.usersKey, this.usersData);
    renderControlForms($createdTable, this.usersInfo);
  }

  get usersKey() {
    if (this.usersData[0] === undefined)
      throw new Error("Ошибка загрузки данных");
    return Object.keys(this.usersData[0]);
  }

  get usersInfo() {
    const userInfoTemplate = [];
    this.usersData.map((user) => {
      const userValues = Object.values(user);
      userInfoTemplate.push([]);

      userValues.forEach((value) => {
        const userInfoObject = userInfoTemplate[userInfoTemplate.length - 1];

        if (value === undefined) throw new Error("Ошибка загрузки данных");

        if (typeof value === "object") {
          if (value?.name) {
            value = value.name;
            return userInfoObject.push(value);
          }

          value = Object.values(value)[0];
          return userInfoObject.push(value);
        }

        if (typeof value === 'number') {
          return userInfoObject.push(value);
        }

        value = String(value);

        return userInfoObject.push(value);
      });
    });

    return userInfoTemplate;
  }
}