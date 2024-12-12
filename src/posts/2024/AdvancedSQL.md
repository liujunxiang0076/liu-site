---
title: 深入探索SQL的高级用法：提升数据库效能的秘诀
tags: [笔记,SQL]
categories: [技术分享]
date: 2024-12-12
description: 在 SQL 中，掌握高级用法可以极大地提升数据处理的效率和深度。以下是一些关于 SQL 高级用法的精炼记录，以供参考和应用：
articleGPT: 在数据库管理的世界里，SQL（Structured Query Language）是连接数据和用户的桥梁。虽然基础的CRUD操作（创建、读取、更新、删除）是大多数数据库交互的核心，但SQL的高级用法能够显著提升数据操作的效率和效能。本文将深入探讨SQL的高级用法，帮助数据库专业人士和开发者解锁更高级的数据操作技巧。
cover: https://imgbed.liujunxiang0076.site/file/1733987873721_PixPin_2024-12-12_15-17-38.png
references:
  - title:  
    url: 
---

#### 





# 一、通用

## 1.窗口函数

### `ROW_NUMBER()`

基本语法如下：

```sql
ROW_NUMBER() OVER (
    [PARTITION BY partition_expression]
    ORDER BY order_expression
)
```

- **PARTITION BY**：可选的，用于将结果集分成多个分区。每个分区内的行号将从 1 开始。
- **ORDER BY**：必需的，指定在每个分区内如何对行进行排序。

**示例**

1. 基本用法

```sql
SELECT
    EmployeeID,
    Name,
    ROW_NUMBER() OVER (ORDER BY Salary DESC) AS RowNum
FROM Employees;
```

在这个例子中，所有员工根据薪水从高到低排序，并为每个员工分配一个行号。

2. 使用 PARTITION BY

```sql
SELECT
    EmployeeID,
    Name,
    Department,
    ROW_NUMBER() OVER (PARTITION BY Department ORDER BY Salary DESC) AS RowNum
FROM Employees;
```

在这个例子中，员工根据部门分组，并在每个部门内根据薪水从高到低排序。每个部门的行号从 1 开始。

### `RANK()`

为结果集中的每一行分配一个排名，如果有并列的行，则排名相同，后续的排名会跳过。

```sql
SELECT
    EmployeeID,
    Name,
    RANK() OVER (ORDER BY Salary DESC) AS RankNum
FROM Employees;
```

### `DENSE_RANK()`

与 `RANK()` 类似，但不会跳过排名。

```sql
SELECT
    EmployeeID,
    Name,
    DENSE_RANK() OVER (ORDER BY Salary DESC) AS DenseRankNum
FROM Employees;
```

### `NTILE(n)`

将结果集分成 n 个组，并为每个组分配组号。

```sql
SELECT
    EmployeeID,
    Name,
    NTILE(4) OVER (ORDER BY Salary DESC) AS Quartile
FROM Employees;
```

### `LEAD() 和 LAG()`

用于访问当前行的后续行或前一行的值。

```sql
SELECT
    EmployeeID,
    Name,
    Salary,
    LAG(Salary, 1) OVER (ORDER BY Salary) AS PreviousSalary,
    LEAD(Salary, 1) OVER (ORDER BY Salary) AS NextSalary
FROM Employees;
```





# 二、SqlServer

## 1.`TRY_CAST` 和 `TRY_CONVERT`

在 SQL Server 中，`TRY_CAST` 和 `TRY_CONVERT` 是两个用于数据类型转换的函数，它们在尝试转换数据类型时非常有用，因为它们在转换失败时不会引发错误，而是返回 `NULL`。这使得它们在处理不确定数据时更加安全，因为它们可以避免程序因类型转换错误而中断执行。

### TRY_CAST

`TRY_CAST` 函数用于将一个表达式转换为指定的数据类型，但它只能用于转换为以下数据类型：

`BIGINT`、`BINARY`、`BIT`、`CHAR`、`DATE`、`DATETIME`、`DATETIME2`、`DATETIMEOFFSET`、`DECIMAL`、`FLOAT`、`INT`、`MONEY`、`NCHAR`、`NVARCHAR`、`NUMERIC`、`NVARCHAR`、`SMALLDATETIME`、`SMALLINT`、`SMALLMONEY`、`TIME`、`TINYINT`、`VARBINARY`、`VARCHAR`

使用 `TRY_CAST` 的语法如下：

```sql
TRY_CAST(expression AS target_data_type)
```

### TRY_CONVERT

`TRY_CONVERT` 函数用于将一个表达式转换为指定的数据类型，它可以转换到更多的数据类型，包括那些 `TRY_CAST` 不支持的类型，如 `UNIQUEIDENTIFIER` 和 XML 类型。`TRY_CONVERT` 的语法如下：

```sql
TRY_CONVERT(target_data_type, expression, [style])
```

其中 `style` 是一个可选参数，用于指定日期和时间格式的样式。

### 示例

以下是 `TRY_CAST` 和 `TRY_CONVERT` 的使用示例：

```sql
-- 使用 TRY_CAST 将字符串转换为整数
DECLARE @String INT;
SET @String = TRY_CAST('123' AS INT);

SELECT @String; -- 返回 123

-- 使用 TRY_CONVERT 将字符串转换为日期
DECLARE @DateString DATE;
SET @DateString = TRY_CONVERT(DATE, '2024-12-25');

SELECT @DateString; -- 返回 2024-12-25

-- 使用 TRY_CONVERT 将字符串转换为 XML
DECLARE @XMLString XML;
SET @XMLString = TRY_CONVERT(XML, '<root><element/></root>');

SELECT @XMLString; -- 返回 XML 数据
```



## 2.`ISNUMERIC()`

`ISNUMERIC()` 函数在 SQL Server 中用于确定一个表达式是否为有效的数值类型。以下是 `ISNUMERIC()` 函数的详细用法：

### 语法

```sql
ISNUMERIC(expression)
```

其中 `expression` 是要检查的表达式。

### 参数

- `expression`：要评估的表达式。

### 返回类型

`ISNUMERIC()` 函数返回一个整数（int），如果输入表达式的计算结果为有效的数值数据类型，则返回 `1`；否则返回 `0`。

### 有效的数值数据类型

`ISNUMERIC()` 认为有效的数值数据类型包括：

- 精确数字：`bigint`、`int`、`smallint`、`tinyint`、`bit`
- 固定精度：`decimal`、`numeric`
- 近似：`float`、`real`
- 货币值：`money`、`smallmoney`

### 特殊注意

`ISNUMERIC()` 函数会将某些非数字字符（如加号 `+`、减号 `-`）和货币符号（如美元符号 `$`）也视为数值，因此返回 `1`。

### 示例

以下是一些使用 `ISNUMERIC()` 函数的示例：

1. **判断字符串是否为数值**：

```sql
SELECT ISNUMERIC('123') AS IsNumeric;  -- 返回 1
SELECT ISNUMERIC('123.45') AS IsNumeric;  -- 返回 1
SELECT ISNUMERIC('123a+') AS IsNumeric;  -- 返回 0
```

2. **在查询中过滤非数值数据**：

```sql
USE AdventureWorks2022;
GO
SELECT City, PostalCode
FROM Person.Address
WHERE ISNUMERIC(PostalCode) <> 1;
GO
```

这个查询将返回所有邮政编码不是数值的记录。

3. **判断数据库名称和ID是否为数值**：

```sql
USE master;
GO
SELECT name,
       ISNUMERIC(name) AS IsNameANumber,
       database_id,
       ISNUMERIC(database_id) AS IsIdANumber
FROM sys.databases;
GO
```

这个查询将返回数据库名称和ID是否为数值的结果。

### 注意事项

- `ISNUMERIC()` 函数只能判断结果的可转换性，但无法判断具体的数值类型。
- 对于包含小数点或指数符号的字符串，也可以被判断为数值。
- 函数对于整数、小数和指数形式的数值都返回 `1`，对于其他字符串都返回 `0`。
- 如果表达式为空（`NULL`），`ISNUMERIC()` 函数将返回 `NULL`，而不是 `FALSE`。

`ISNUMERIC()` 函数是 SQL Server 中用于检查一个表达式是否为数字的函数，通过对字符串进行解析，该函数返回一个布尔值，表示给定的表达式是否可以被解析为有效的数值。在使用该函数时，我们需要注意它的判断规则，并且注意对包含特殊字符的字符串进行判断时的结果。
