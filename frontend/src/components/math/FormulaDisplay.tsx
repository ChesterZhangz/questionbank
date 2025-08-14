import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

interface FormulaDisplayProps {
  formula: string;
  display?: boolean;
  className?: string;
}

const FormulaDisplay: React.FC<FormulaDisplayProps> = ({
  formula,
  display = true,
  className = '',
}) => {
  try {
    if (display) {
      return (
        <div className={`formula-container ${className}`}>
          <BlockMath math={formula} />
        </div>
      );
    } else {
      return <InlineMath math={formula} />;
    }
  } catch (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        公式渲染错误: {formula}
      </div>
    );
  }
};

export default FormulaDisplay; 