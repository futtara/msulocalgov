// Sync variables
var category = 'county';
var name_label = 'County';
var all_years = [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
var county_all_classes = [1, 2, 3, 4, 5, 6, 7];
var county_table_fields = [
  'Population',
  //'County Seat',
  //'Class', // deprecated
  'MACO District',
  'Income',
  'Taxable Valuation (Mill Value)',
  'General Fund Mills Levied',
  'Total Mills Levied',
  'General Funds Appropriated',
  'Total Funds Appropriated',
  'FTE',
  'Road Miles',
  'Form of Government',
  'Government Powers',
  'Commission Size',
  'Other Elected Officials',
  'Type of Election'
];
var county_numeric_fields = [
  'Population',
  //'Class', // deprecated
  'MACO District',
  'Income',
  'Taxable Valuation (Mill Value)',
  'General Fund Mills Levied',
  'Total Mills Levied',
  'General Funds Appropriated',
  'Total Funds Appropriated',
  'FTE',
  'Road Miles',
  'Commission Size',
  'Other Elected Officials'
];
var county_historical_fields = [
  'Population',
  //'Class', // deprecated
  'Income',
  'Taxable Valuation (Mill Value)',
  'General Fund Mills Levied',
  'Total Mills Levied',
  'General Funds Appropriated',
  'Total Funds Appropriated',
  'FTE',
  'Road Miles',
  'Commission Size'
];
var county_comparison_fields = [
  'Population',
  'Income',
  'Taxable Valuation (Mill Value)',
  'General Fund Mills Levied',
  'Total Mills Levied',
  'General Funds Appropriated',
  'Total Funds Appropriated',
  'FTE',
  'Road Miles',
  'Commission Size'
];
var county_map_fields = [
  'Population',
  //'Class', // deprecated
  'MACO District',
  'Income',
  'Taxable Valuation (Mill Value)',
  'General Fund Mills Levied',
  'Total Mills Levied',
  'General Funds Appropriated',
  'Total Funds Appropriated',
  'FTE',
  'Road Miles',
  'Commission Size',
  'Other Elected Officials',
  'Form of Government',
  'Government Powers',
  'Type of Election'
];
var county_info_fields = [
  'Population',
  'MACO District',
  'Taxable Valuation (Mill Value)',
  'Total Mills Levied',
  'Total Funds Appropriated',
  'FTE',
  'Form of Government'
];
var county_order_fields = [
  //'Population',
  'Form of Government'
];
// Note formgov_order same for sity or county
var formgov_order = {
  'Com': 0,
  'Com Ch': 1,
  'Com(A)': 2,
  'Com(C)': 3,
  'Com Ex': 4,
  'Com Ex(A)': 5,
  'Com Ex(C)': 6,
  'Mgr': 7,
  'Mgr(A)': 8,
  'Mgr(C)': 9,
  'TM(C)': 10,
  'No proposal': 11,
  'NA': 20
};

var all_counties = [
  'Anaconda-Deer Lodge',
  'Beaverhead',
  'Big Horn',
  'Blaine',
  'Broadwater',
  'Butte-Silver Bow',
  'Carbon',
  'Carter',
  'Cascade',
  'Chouteau',
  'Custer',
  'Daniels',
  'Dawson',
  'Fallon',
  'Fergus',
  'Flathead',
  'Gallatin',
  'Garfield',
  'Glacier',
  'Golden Valley',
  'Granite',
  'Hill',
  'Jefferson',
  'Judith Basin',
  'Lake',
  'Lewis and Clark',
  'Liberty',
  'Lincoln',
  'Madison',
  'McCone',
  'Meagher',
  'Mineral',
  'Missoula',
  'Musselshell',
  'Park',
  'Petroleum',
  'Phillips',
  'Pondera',
  'Powder River',
  'Powell',
  'Prairie',
  'Ravalli',
  'Richland',
  'Roosevelt',
  'Rosebud',
  'Sanders',
  'Sheridan',
  'Stillwater',
  'Sweet Grass',
  'Teton',
  'Toole',
  'Treasure',
  'Valley',
  'Wheatland',
  'Wibaux',
  'Yellowstone'
];

// Color schemes from Colorbrewer
var colorsPop = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
var colors6QualSet2 = ['#66C2A5', '#FC8D62', '#8DA0CB', '#E78AC3', '#A6D854', '#FFD92F'];
var colors12QualSet3 = ['#8DD3C7', '#FFFFB3', '#BEBADA', '#FB8072', '#80B1D3', '#FDB462', '#B3DE69', '#FCCDE5', '#D9D9D9', '#BC80BD', '#CCEBC5', '#FFED6F'];

// Map attributes depending on field type
var county_map_attr = {
  'Population': {
    'breaks': [0, 1000, 2000, 5000, 10000, 20000, 50000, 100000],
    'colors': colorsPop
  },
  /* Class for counties deprecated
  'Class': {
    breaks: ['1', '2', '3', '4', '5', '6', '7'],
    colors: colorsPop
  }, */
  'MACO District': {
    breaks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    colors: colors12QualSet3
  },
  'Income': {
    breaks: [0, 10000, 20000, 30000, 40000, 50000, 60000],
    colors: colorsPop
  },
  'Taxable Valuation (Mill Value)': {
    breaks: [0, 20000, 50000, 100000, 150000, 200000, 250000, 300000],
    colors: colorsPop
  },
  'General Fund Mills Levied': {
    breaks: [0, 50, 100, 150, 200, 250, 300],
    colors: colorsPop
  },
  'Total Mills Levied': {
    breaks: [0, 50, 100, 150, 200, 250, 300],
    colors: colorsPop
  },
  'General Funds Appropriated': {
    breaks: [0, 10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000],
    colors: colorsPop
  },
  'Total Funds Appropriated': {
    breaks: [0, 10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000],
    colors: colorsPop
  },
  'FTE': {
    breaks: [5, 10, 50, 100, 200, 500],
    colors: colors12QualSet3
  },
  'Road Miles': {
    breaks: [0, 100, 200, 500, 1000, 2000, 5000, 10000],
    colors: colorsPop
  },
  'Commission Size': {
    breaks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    colors: colors12QualSet3
  },
  'Other Elected Officials': {
    breaks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    colors: colors12QualSet3
  },
  'Form of Government': {
    breaks: ['Com', 'Com (a)', 'Com (c)', 'Com Ex (c)', 'Mgr', 'Mgr (c)'],
    colors: colors6QualSet2
  },
  'Type of Election': {
    breaks: ['Np', 'P'],
    colors: colors6QualSet2
  },
  'Government Powers': {
    breaks: ['Gen', 'Self'],
    colors: colors6QualSet2
  }
};

// Assign county lists to generic list names
var table_fields = county_table_fields;
var numeric_fields = county_numeric_fields;
var historical_fields = county_historical_fields;
var comparison_fields = county_comparison_fields;
var map_fields = county_map_fields;
var info_fields = county_info_fields;
var order_fields = county_order_fields;
var map_attr = county_map_attr;
var all_names = all_counties;
var all_classes = county_all_classes;

