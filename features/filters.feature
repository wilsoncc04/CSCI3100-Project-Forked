Feature: Marketplace Dropdown Filters
  As a CUHK student
  So that I can accurately find items relevant to me
  I want the filtering dropdowns to provide all the correct categories and colleges
  
  @javascript
  Scenario: View available College options
    Given I am on the marketplace index page
    Then the "College" dropdown should contain the following options:
      | Chung Chi      |
      | New Asia       |
      | United         |
      | Shaw           |
      | Morningside    |
      | S.H. Ho        |
      | C.W. Chu       |
      | Wu Yee Sun     |
      | Lee Woo Sing   |

  @javascript
  Scenario: View available Goods Type options
    Given I am on the marketplace index page
    Then the "Goods Type" dropdown should contain the following options:
      | Textbooks  |
      | Furniture  |
      | Stationery |
      | Snacks     |