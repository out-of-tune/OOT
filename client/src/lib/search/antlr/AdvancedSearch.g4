grammar AdvancedSearch;

nodeType            : WORD;
attributeSearch     : (WORD | TEXT);
attributeData       : (WORD | TEXT | DECIMAL);
attribute           : attributeSearch OPERATOR attributeData;
attributes          : (WHITESPACE attribute)+;
searchPart          : nodeType (COLON attributes)?;
search              : (searchPart)*;


fragment A          : ('A'|'a') ;
fragment N          : ('N'|'n') ;
fragment D          : ('D'|'d') ;
fragment L          : ('L'|'l') ;
fragment I          : ('I'|'i') ;
fragment K          : ('K'|'k') ;
fragment E          : ('E'|'e') ;

fragment LOWERCASE  : [a-z] ;
fragment UPPERCASE  : [A-Z] ;
fragment UMLAUTS    : [\u00C0-\u02B8];
fragment STANDARDC  : ([\u0020-\u0021]|[\u0023-\u007E]);
fragment SPECIALC   : [\u00A1-\u00FF];
fragment NUMBER     : [0-9] ;
fragment QUOTE      : ('"');


WORD                : (LOWERCASE | UMLAUTS | UPPERCASE | NUMBER | '_' | '-')+ ;
TEXT                : QUOTE (STANDARDC | SPECIALC | UMLAUTS | NUMBER)* QUOTE;
DECIMAL             : (NUMBER)+ ('.'|',') (NUMBER)+;
WHITESPACE          : (' ' | '\t')+ ;
COLON               : (':');
OPERATOR            : ('=' | '>' | '<' |  '>=' | '!=' |'<='| (WHITESPACE L I K E WHITESPACE));
OPENPARAN           : ('(');
CLOSEPARAN          : (')');
