-- 10. SQL View for Posts with Aggregated Data
-- This view simplifies fetching posts with their author's username/avatar and aggregated counts.
CREATE OR REPLACE VIEW public.posts_with_aggregated_data AS
SELECT
  p.id,
  p.created_at,
  p.title,
  p.content,
  p.author_id,
  p.moderation_status,
  pr.username AS author_username,
  pr.avatar_url AS author_avatar_url,
  (SELECT count(*)::int FROM public.post_reactions lr WHERE lr.post_id = p.id AND lr.type = 'like') AS likes_count,
  (SELECT count(*)::int FROM public.post_reactions dr WHERE dr.post_id = p.id AND dr.type = 'dislike') AS dislikes_count,
  (SELECT count(*)::int FROM public.comments c WHERE c.post_id = p.id) AS comments_count
FROM
  public.posts p
LEFT JOIN
  public.profiles pr ON p.author_id = pr.id;