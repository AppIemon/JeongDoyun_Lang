// 유틸리티 함수
export function binToDecimal(binStr) {
  return parseInt(binStr, 2);
}

// 문법 패턴 정의
const PATTERNS = {
  // 변수 관련
  VARIABLE_DECLARE: /^정도윤  정도윤$/,
  VARIABLE_GET: /^정도윤정도윤  정도윤$/,
  VARIABLE_ASSIGN: /^정도윤 정도윤정도윤$/,
  
  // 출력 관련
  PRINT_CHAR: /^정도윤정도윤$/,
  PRINT_NUMBER: /^정도윤정도윤�도윤 $/,
  PRINT_MARKER: /^정도윤$/,
  APPEND_MODE: /^정도윤정도윤정도윤$/,
  
  // 산술 연산자
  PLUS: /^  정도윤정도윤$/,
  MINUS: /^  정도윤 정도윤$/,
  MULTIPLY: /^  정도윤$/,
  DIVIDE: /^  정도윤정도윤정도윤$/,
  
  // 비교 연산자
  EQUAL: /^   정도윤$/,
  GREATER: /^   정도윤정도윤$/,
  LESS: /^   정도윤 정도윤$/,
  
  // 논리 연산자
  AND: /^   정도윤정도윤 정도윤$/,
  OR: /^   정도윤 정도윤정도윤$/,
  NOT: /^   정도윤 정도윤 정도윤$/,
  
  // 제어문
  IF: /^정도윤 정도윤 정도윤$/,
  ELSE: /^정도윤  정도윤  정도윤$/,
  
  // 반복문
  LOOP: /^정도윤정도윤 정도윤정도윤$/,
  LOOP_COUNT: /^ 정도윤 정도윤$/
};

// 에러 타입 정의
export const ERROR_TYPES = {
  INVALID_PATTERN: '패턴 오류',
  VARIABLE_NOT_FOUND: '변수 없음',
  INVALID_BINARY: '이진수 오류',
  SYNTAX_ERROR: '구문 오류',
  OPERATOR_ERROR: '연산자 오류',
  BLOCK_ERROR: '블록 오류'
};

// 연산 수행 함수
function performOperation(operator, a, b) {
  switch(operator) {
    case 'PLUS': return a + b;
    case 'MINUS': return a - b;
    case 'MULTIPLY': return a * b;
    case 'DIVIDE': return a / b;
    case 'EQUAL': return a === b ? 1 : 0;
    case 'GREATER': return a > b ? 1 : 0;
    case 'LESS': return a < b ? 1 : 0;
    case 'AND': return a && b ? 1 : 0;
    case 'OR': return a || b ? 1 : 0;
    case 'NOT': return !a ? 1 : 0;
    default: return null;
  }
}

// 조건문 평가 함수
function evaluateCondition(conditionLines, variables) {
  const { result } = decodeCode(conditionLines.join('\n'));
  return result && result !== '0' && result.toLowerCase() !== 'false';
}

// 이진수 변환 함수
function convertToBinary(line) {
  let binaryString = '';
  line.split('').forEach(char => {
    if (char === ' ') binaryString += '0';
    else if (char === '정') binaryString += '1';
    // 디버깅용
    console.log('문자:', char, '-> 이진:', char === ' ' ? '0' : (char === '정' ? '1' : 'x'));
  });
  return binaryString;
}

export function decodeCode(code) {
  const lines = code.split("\n");
  let result = '';
  let appendMode = false;
  let variables = {};
  let errors = [];
  let lineNumber = 0;
  let skipElseBlock = false;
  let inIfBlock = false;
  
  try {
    for (let i = 0; i < lines.length; i++) {
      lineNumber = i + 1;
      const line = lines[i].trim();
      
      if (line === '') continue;

      // if 문 처리
      if (PATTERNS.IF.test(line)) {
        inIfBlock = true;
        const conditionLine = lines[i + 1];
        const codeLine = lines[i + 2];
        
        if (!conditionLine || !codeLine) {
          throw {
            type: ERROR_TYPES.SYNTAX_ERROR,
            message: 'if 문의 조건이나 실행 코드가 없습니다.',
            line: lineNumber,
            code: line
          };
        }

        skipElseBlock = evaluateCondition([conditionLine], variables);
        if (!skipElseBlock) {
          i += 2;
        } else {
          const { result: ifResult } = decodeCode(codeLine);
          if (!appendMode) result = '';
          result += ifResult;
          i += 2;
        }
        continue;
      }

      // else 문 처리
      if (PATTERNS.ELSE.test(line)) {
        if (!inIfBlock) {
          throw {
            type: ERROR_TYPES.SYNTAX_ERROR,
            message: 'else 문은 if 문 없이 사용할 수 없습니다.',
            line: lineNumber,
            code: line
          };
        }

        if (!skipElseBlock) {
          const codeLine = lines[i + 1];
          if (!codeLine) {
            throw {
              type: ERROR_TYPES.SYNTAX_ERROR,
              message: 'else 문의 실행 코드가 없습니다.',
              line: lineNumber,
              code: line
            };
          }
          const { result: elseResult } = decodeCode(codeLine);
          if (!appendMode) result = '';
          result += elseResult;
        }
        i++;
        inIfBlock = false;
        continue;
      }

      // 반복문 처리
      if (PATTERNS.LOOP.test(line)) {
        const countLine = lines[i + 1];
        const codeLine = lines[i + 2];
        
        if (!countLine || !PATTERNS.LOOP_COUNT.test(countLine)) {
          throw {
            type: ERROR_TYPES.SYNTAX_ERROR,
            message: '반복 횟수가 올바르지 않습니다.',
            line: lineNumber,
            code: line
          };
        }

        if (!codeLine) {
          throw {
            type: ERROR_TYPES.SYNTAX_ERROR,
            message: '반복할 코드가 없습니다.',
            line: lineNumber,
            code: line
          };
        }

        const countBinary = convertToBinary(countLine);
        const loopCount = binToDecimal(countBinary);

        for (let k = 0; k < loopCount; k++) {
          const { result: loopResult } = decodeCode(codeLine);
          if (!appendMode) result = '';
          result += loopResult;
        }

        i += 2;
        continue;
      }

      // 변수 선언
      if (PATTERNS.VARIABLE_DECLARE.test(line)) {
        const nextLine = lines[i + 1];
        const valueLine = lines[i + 2];
        
        if (!nextLine || !PATTERNS.PRINT_CHAR.test(nextLine)) {
          throw {
            type: ERROR_TYPES.SYNTAX_ERROR,
            message: '변수 선언 �턴이 올바르지 않습니다.',
            line: lineNumber,
            code: line,
            errorPosition: line.indexOf('  ')
          };
        }

        if (!valueLine) {
          throw {
            type: ERROR_TYPES.SYNTAX_ERROR,
            message: '변수 값이 누락되었습니다.',
            line: lineNumber + 2,
            code: line
          };
        }

        const binaryString = convertToBinary(valueLine);
        const varName = String.fromCharCode(binToDecimal(binaryString));
        variables[varName] = '';
        i += 2;
        continue;
      }

      // 변수 가져오기
      if (PATTERNS.VARIABLE_GET.test(line)) {
        const nextLine = lines[i + 1];
        if (nextLine && PATTERNS.PRINT_CHAR.test(nextLine)) {
          const varLine = lines[i + 2];
          if (varLine) {
            const binaryString = convertToBinary(varLine);
            const varName = String.fromCharCode(binToDecimal(binaryString));
            
            if (variables[varName] !== undefined) {
              if (!appendMode) result = '';
              result += variables[varName];
            } else {
              throw {
                type: ERROR_TYPES.VARIABLE_NOT_FOUND,
                message: `변수 '${varName}'를 찾을 수 없습니다.`,
                line: lineNumber + 2,
                code: varLine
              };
            }
          }
          i += 2;
          continue;
        }
      }

      // 변수 할당
      if (PATTERNS.VARIABLE_ASSIGN.test(line)) {
        const varNameLine = lines[i + 1];
        const valueLine = lines[i + 2];
        if (varNameLine && valueLine) {
          const varBinaryString = convertToBinary(varNameLine);
          const varName = String.fromCharCode(binToDecimal(varBinaryString));
          
          const valBinaryString = convertToBinary(valueLine);
          if (valueLine.startsWith(' ')) {
            variables[varName] = binToDecimal(valBinaryString).toString();
          } else {
            variables[varName] = String.fromCharCode(binToDecimal(valBinaryString));
          }
          i += 2;
          continue;
        }
      }

      // 문자 이어붙이기 모드
      if (PATTERNS.APPEND_MODE.test(line)) {
        appendMode = true;
        continue;
      }

      // 문자 출력
      if (PATTERNS.PRINT_CHAR.test(line)) {
        const markerLine = lines[i + 1];
        const valueLine = lines[i + 2];
        
        if (markerLine === '정도윤' && valueLine) {
          const binaryString = convertToBinary(valueLine);
          if (binaryString) {
            if (!appendMode) result = '';
            result += String.fromCharCode(binToDecimal(binaryString));
          }
        }
        i += 2;
        continue;
      }

      // 숫자 출력
      if (PATTERNS.PRINT_NUMBER.test(line)) {
        const nextLine = lines[i + 1];
        if (nextLine) {
          const binaryString = convertToBinary(nextLine);
          if (binaryString) {
            const decimal = binToDecimal(binaryString);
            if (!appendMode) result = '';
            result += decimal.toString();
          }
        }
        i++;
        continue;
      }

      // 연산자 처리
      for (const [opName, pattern] of Object.entries(PATTERNS)) {
        if (pattern.test(line) && opName.match(/^(PLUS|MINUS|MULTIPLY|DIVIDE|EQUAL|GREATER|LESS|AND|OR|NOT)$/)) {
          const nextLine = lines[i + 1];
          const secondLine = lines[i + 2];
          
          if (!nextLine) {
            throw {
              type: ERROR_TYPES.OPERATOR_ERROR,
              message: '연산에 필요한 값이 누락되었습니다.',
              line: lineNumber,
              code: line
            };
          }

          let val1 = variables[nextLine] !== undefined ? parseFloat(variables[nextLine]) : parseFloat(nextLine);
          let val2 = null;
          
          if (opName !== 'NOT') {
            if (!secondLine) {
              throw {
                type: ERROR_TYPES.OPERATOR_ERROR,
                message: '두 번째 피연산자가 누락되었습니다.',
                line: lineNumber,
                code: line
              };
            }
            val2 = variables[secondLine] !== undefined ? parseFloat(variables[secondLine]) : parseFloat(secondLine);
          }

          if (isNaN(val1) || (val2 !== null && isNaN(val2))) {
            throw {
              type: ERROR_TYPES.OPERATOR_ERROR,
              message: '유효하지 않은 숫자입니다.',
              line: lineNumber,
              code: line
            };
          }

          const opResult = performOperation(opName, val1, val2);
          if (opResult !== null) {
            if (!appendMode) result = '';
            result += opResult.toString();
          }

          i += val2 !== null ? 2 : 1;
          break;
        }
      }
    }
  } catch (error) {
    errors.push(error);
  }

  return {
    result,
    errors,
    variables: Object.keys(variables).map(key => ({
      name: key,
      value: variables[key]
    }))
  };
}