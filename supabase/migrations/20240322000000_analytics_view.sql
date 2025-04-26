-- Create or replace the question_stats view
CREATE OR REPLACE VIEW public.question_stats AS
SELECT
    q.id,
    q.question,
    COUNT(ua.*) AS total_attempts,
    SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) AS correct_count,
    CASE 
        WHEN COUNT(ua.*) > 0 
        THEN (SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::FLOAT / COUNT(ua.*)::FLOAT) * 100
        ELSE 0 
    END AS percentage_correct
FROM public.questions q
LEFT JOIN public.user_answers ua ON ua.question_id = q.id
GROUP BY q.id, q.question;

-- Grant access to the view
GRANT SELECT ON public.question_stats TO authenticated; 