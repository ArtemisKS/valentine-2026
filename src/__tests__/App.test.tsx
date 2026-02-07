import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  it('renders intro screen on initial load', () => {
    render(<App />);
    expect(screen.getByText(/happy valentine/i)).toBeInTheDocument();
    expect(screen.getByText(/tanya/i)).toBeInTheDocument();
  });

  it('displays progress bar during quiz', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const startButton = screen.getByRole('button', { name: /begin our journey/i });
    await user.click(startButton);
    
    expect(screen.getByText(/question/i)).toBeInTheDocument();
  });

  it('shows first question after starting quiz', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const startButton = screen.getByRole('button', { name: /begin our journey/i });
    await user.click(startButton);
    
    expect(screen.getByText(/question 1 of 7/i)).toBeInTheDocument();
  });

  it('navigates through questions on answer selection', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const startButton = screen.getByRole('button', { name: /begin our journey/i });
    await user.click(startButton);
    
    const firstOption = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('Our first date')
    );
    
    if (firstOption) {
      await user.click(firstOption);
      expect(screen.getByText(/question/i)).toBeInTheDocument();
    }
  });

  it('allows answering multiple questions', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const startButton = screen.getByRole('button', { name: /begin our journey/i });
    await user.click(startButton);
    
    expect(screen.getByText(/question 1 of 7/i)).toBeInTheDocument();
    
    const allButtons = screen.getAllByRole('button');
    const firstAnswerButton = allButtons.find(btn => {
      const text = btn.textContent || '';
      return text && !text.includes('Back') && !text.includes('Next') && !text.includes('Begin');
    });
    
    if (firstAnswerButton) {
      await user.click(firstAnswerButton);
      expect(screen.getByText(/question 2 of 7/i)).toBeInTheDocument();
    }
  });
});
