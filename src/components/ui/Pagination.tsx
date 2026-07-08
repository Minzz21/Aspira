import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const total = totalPages;
    const current = currentPage;
    
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-white rounded-b-xl gap-4">
      <span className="text-sm text-gray-600">
        Menampilkan <span className="font-semibold text-gray-900">{totalItems === 0 ? 0 : startItem}</span> - <span className="font-semibold text-gray-900">{endItem}</span> dari <span className="font-semibold text-gray-900">{totalItems}</span> data
      </span>
      <div className="inline-flex rounded-lg shadow-sm">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        {getVisiblePages().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-4 py-2 text-sm font-medium border-y border-r border-gray-300 text-gray-500 bg-white">
                ...
              </span>
            );
          }
          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`px-4 py-2 text-sm font-medium border-y border-r border-gray-300 transition-colors ${
                currentPage === page
                  ? 'z-10 text-primary-light bg-green-50 border-primary-light'
                  : 'text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {page}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-y border-r border-gray-300 rounded-r-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
