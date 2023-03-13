export default [
    { id: 1, name: "INT", type: "int", props: [{ name: "AUTO_INCREMENT", label: "Tự động tăng (AUTO_INCREMENT)", type: "bool" }] },
    { id: 2, name: "INT UNSIGNED", type: "int", props: [{ name: "AUTO_INCREMENT", label: "Tự động tăng (AUTO_INCREMENT)", type: "bool" }]},
    { id: 3, name: "BIG INT", type: "int", props: [{ name: "AUTO_INCREMENT", label: "Tự động tăng (AUTO_INCREMENT)", type: "bool" }] },
    { id: 4, name: "BIG INT UNSIGNED", type: "int", props: [{ name: "AUTO_INCREMENT", label: "Tự động tăng (AUTO_INCREMENT)", type: "bool" }]},
    { id: 5, name: "BOOL", type: "bool", props: [ { name: "IF_TRUE", label: "Giá trị đúng", type: "text" }, { name: "IF_FALSE", label: "Giá trị sai", type: "text" }  ] },
    { id: 6, name: "DECIMAL", type: "floating-point",
        props: [ { name: "LENGTH", label: "Độ dài tối đa", type: "int" }, { name: "DELIMITER", label: "Vị trí dấu chấm", type: "int" } ] }, /* dec(5,2) ~ 999.99 */
    { id: 7, name: "DECIMAL UNSIGNED", type: "floating-point",
        props: [ { name: "LENGTH", label: "Độ dài tối đa", type: "int" }, { name: "DELIMITER", label: "Vị trí dấu chấm", type: "int" } ] }, /* dec(5,2) ~ 999.99 */
    { id: 8, name: "DATE", type: "date", props: [] },
    { id: 9, name: "TIME", type: "time", props: [] },
    { id: 10, name: "DATETIME", type: "datetime", props: [] },
    { id: 11, name: "TEXT", type: "text", props: [] },
    { id: 12, name: "CHAR", type: "char", props: [ { name: "LENGTH", label: "Độ dài tối đa", type: "int" } ] }, /* Char( 255 ) */
    { id: 13, name: "VARCHAR", type: "char", props: [ { name: "LENGTH", label: "Độ dài tối đa", type: "int" } ] }, /* Varchar( 255 ) */
]
