Feature: Marketplace Hover Navigation Menu
  As a CUHK student
  So that I can accurately find items relevant to me
  I want the hover navigation menu to display all the correct colleges and goods categories

  @javascript
  Scenario: View available College filtering links
    Given I am on the marketplace index page
    When I hover over the "Browse Categories" menu
    Then I should see the following category links:
      | Chung Chi College |
      | New Asia College  |
      | United College    |
      | Shaw College      |
      | Morningside       |
      | S.H. Ho           |
      | C.W. Chu          |
      | Wu Yee Sun        |
      | Lee Woo Sing      |

  @javascript
  Scenario: View available Goods Type filtering links
    Given I am on the marketplace index page
    When I hover over the "Browse Categories" menu
    Then I should see the following category links:
      | Textbooks & Notes      |
      | Electronics & Gadgets  |
      | Furniture & Home       |
      | Clothing & Accessories |
      | Stationery & Supplies  |
      | Snacks & Food          |
      | Others                 |