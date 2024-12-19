---
title: 深入探索SQL的高级用法：提升数据库效能的秘诀
tags: [笔记,SQL]
categories: [技术分享]
date: 2024-12-12
description: 在 SQL 中，掌握高级用法可以极大地提升数据处理的效率和深度。以下是一些关于 SQL 高级用法的精炼记录，以供参考和应用：
articleGPT: 在数据库管理的世界里，SQL（Structured Query Language）是连接数据和用户的桥梁。虽然基础的CRUD操作（创建、读取、更新、删除）是大多数数据库交互的核心，但SQL的高级用法能够显著提升数据操作的效率和效能。本文将深入探讨SQL的高级用法，帮助数据库专业人士和开发者解锁更高级的数据操作技巧。
cover: https://imgbed.liujunxiang0076.site/file/1733987873721_PixPin_2024-12-12_15-17-38.png

---





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

## 2.日期时间处理函数

### `DATEADD()`

`DATEADD` 是 SQL Server 中的一个函数，用于将指定的时间间隔添加到指定的日期和时间。这个函数在处理日期和时间的计算时非常有用，比如计算未来或过去的某个日期。

#### 基本语法

```sql
DATEADD(datepart, number, date)
```

- `datepart`：必需的，指定要添加时间间隔的日期部分。例如：`year`、`month`、`day`、`hour`、`minute` 等。
- `number`：必需的，指定要添加（或减去，如果是负数）的时间间隔数量。
- `date`：必需的，指定要添加时间间隔的日期和时间表达式。

#### 参数说明

- `datepart` 参数指定了日期的哪一部分将被修改。例如，如果您想要添加天数，可以使用 `day` 作为 `datepart`。
- `number` 参数是一个整数，表示要添加（或减去）的时间间隔的数量。如果是正数，则添加；如果是负数，则减去。
- `date` 参数是一个有效的日期和时间表达式，表示要在其上执行计算的日期和时间。

#### 示例

以下是一些使用 `DATEADD` 函数的示例：

1. **添加天数**：

```sql
SELECT DATEADD(day, 10, GETDATE()) AS TenDaysLater;
```

这将获取当前日期加上 10 天的日期。

2. **减去月份**：

```sql
SELECT DATEADD(month, -3, GETDATE()) AS ThreeMonthsAgo;
```

这将获取当前日期减去 3 个月的日期。

3. **添加年份**：

```sql
SELECT DATEADD(year, 5, '2024-01-01') AS FiveYearsLater;
```

这将获取 2024 年 1 月 1 日加上 5 年的日期。

4. **添加小时**：

```sql
SELECT DATEADD(hour, 24, '2024-01-01 10:00:00') AS TwentyFourHoursLater;
```

这将获取 2024 年 1 月 1 日 10 点加上 24 小时的日期和时间。

5. **添加分钟**：

```sql
SELECT DATEADD(minute, 30, GETDATE()) AS ThirtyMinutesLater;
```

这将获取当前时间加上 30 分钟的时间。

#### 注意事项

- `DATEADD` 函数可以处理日期和时间类型的数据，但不能直接用于字符串。如果需要对字符串执行日期计算，应先使用 `CONVERT` 或 `CAST` 函数将其转换为日期或时间类型。
- 当添加的月份数导致日期超出当前月份的天数时（例如，1 月 31 日加上 1 个月），`DATEADD` 会自动调整日期到下个月的相应日期（2 月 28 日或 29 日，取决于是否是闰年）。
- `DATEADD` 函数在处理时间间隔时，会考虑日期和时间的边界条件，如月份的天数、闰年等。



---



### DATEDIFF()

`DATEDIFF` 函数是 SQL 中的一个常用函数，用于计算两个日期或日期时间值之间的差异。不同数据库系统中的 `DATEDIFF` 函数在功能和语法上可能有所不同，但它们的基本用途是一致的。以下是 `DATEDIFF` 函数的一些详细讲解：

#### 基本语法

在 SQL Server 中，`DATEDIFF` 函数的基本语法如下：

```sql
DATEDIFF(datepart, startdate, enddate)
```

- `datepart`：指定计算差值的单位，如 `year`、`month`、`day`、`hour`、`minute` 等。
- `startdate`：计算的起始日期。
- `enddate`：计算的结束日期。

#### 使用场景

`DATEDIFF` 函数常用于以下场景：

- 计算年龄：通过比较出生日期和当前日期来计算年龄。
- 活动周期分析：确定两个事件之间的时间间隔。
- 时间跨度计算：计算项目持续时间或任务完成时间。

#### 示例

在 SQL Server 中，计算两个日期之间的天数差：

```sql
SELECT DATEDIFF(day, '2024-11-01', '2024-11-28') AS DayDifference;
```

这将返回 27，表示两个日期之间相差 27 天。

#### 跨数据库差异

- SQL Server 支持多种时间单位的差值计算。
- MySQL 的 `DATEDIFF` 功能较为简单，仅支持以天为单位计算两个日期的差值。
- Oracle 和 PostgreSQL 也有类似的函数，但可能在语法和功能上有所不同。

`DATEDIFF` 函数是一个强大的工具，它使得日期相关的计算变得简单快捷。在使用时，需要根据您所使用的数据库系统来确定正确的语法和功能。

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

## 3.获取相关特定日期

### 创建日期表(按需更改为表)

```sql
-- 步骤1：创建日期表
DECLARE @DateTable TABLE
                   (
                       DateId         INT IDENTITY ( 1, 1 ) PRIMARY KEY,
                       DateValue      DATE,
                       YEAR           INT,
                       MONTH          INT,
                       DAY            INT,
                       Weekday        INT,
                       Weekday_CN     VARCHAR(50),
                       Weeknum        INT,
                       StartOfweek_EN DATE,
                       EndOfweek_EN   DATE,
                       StartOfweek_CN DATE,
                       EndOfweek_CN   DATE
                   );
-- 步骤2：设置日期范围
DECLARE @StartDate DATE;
DECLARE @EndDate DATE;
SET @StartDate = '2024-01-01';
SET @EndDate = '2099-12-31';
-- 步骤3：生成日期列表
DECLARE @CurrentDate DATE;

SET @CurrentDate = @StartDate;
WHILE @CurrentDate <= @EndDate
    BEGIN-- 步骤4：插入日期数据
        SET DATEFIRST 1
        INSERT INTO @DateTable (DateValue, YEAR, MONTH, DAY, Weekday, Weekday_CN, Weeknum, StartOfweek_EN, EndOfweek_EN,
                                StartOfweek_CN, EndOfweek_CN)
        VALUES (@CurrentDate,
                YEAR(@CurrentDate),
                MONTH(@CurrentDate),
                DAY(@CurrentDate),
                DATEPART(WEEKDAY,
                         @CurrentDate),
                CASE
                    WHEN DATEPART(WEEKDAY, @CurrentDate) = 7 THEN
                        '周日'
                    WHEN DATEPART(WEEKDAY, @CurrentDate) = 1 THEN
                        '周一'
                    WHEN DATEPART(WEEKDAY, @CurrentDate) = 2 THEN
                        '周二'
                    WHEN DATEPART(WEEKDAY, @CurrentDate) = 3 THEN
                        '周三'
                    WHEN DATEPART(WEEKDAY, @CurrentDate) = 4 THEN
                        '周四'
                    WHEN DATEPART(WEEKDAY, @CurrentDate) = 5 THEN
                        '周五'
                    WHEN DATEPART(WEEKDAY, @CurrentDate) = 6 THEN
                        '周六'
                    END,
                DATEPART(WEEK, @CurrentDate),
                DATEADD(WEEK, DATEDIFF(WEEK, 0, @CurrentDate), - 1),
                DATEADD(DAY, 6, DATEADD(WEEK, DATEDIFF(WEEK, 0, @CurrentDate), - 1)),
                DATEADD(WEEK, DATEDIFF(WEEK, 0, @CurrentDate), 0),
                DATEADD(DAY, 6, DATEADD(WEEK, DATEDIFF(WEEK, 0, @CurrentDate), 0)));
        SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
    END
SELECT *
FROM @DateTable
```



### 获取当月开始日期

```sql
-- 当前月份的第一天
SELECT DATEADD(DAY, 1 - DAY(GETDATE()), GETDATE()) AS FirstDayOfMonth;
```

### 获取当月结束日期

```sql
-- 当前月份的最后一天
SELECT EOMONTH(GETDATE()) AS LastDayOfMonth;
```



## 4.查询表相关信息

```sql
SELECT 
    TABLE_CATALOG, -- 列所属的表所在的目录名
    TABLE_SCHEMA, -- 列所属的表所在的模式（数据库）名
    TABLE_NAME, -- 列所属的表的名称
    COLUMN_NAME, -- 列的名称
    ORDINAL_POSITION, -- 列在表中的顺序位置
    COLUMN_DEFAULT, -- 列的默认值
    IS_NULLABLE, -- 列是否允许为空（'YES' 或 'NO'）
    DATA_TYPE, -- 列的数据类型
    CHARACTER_MAXIMUM_LENGTH, -- 字符数据类型列的最大长度
    CHARACTER_OCTET_LENGTH, -- 列的最大字节数
    NUMERIC_PRECISION, -- 数值类型列的精度
    NUMERIC_SCALE, -- 数值类型列的小数位数
    DATETIME_PRECISION, -- 日期时间类型列的精度
    CHARACTER_SET_NAME, -- 列的字符集名称
    COLLATION_NAME -- 列的排序规则名称
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'pls_line';
```

