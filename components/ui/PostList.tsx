import { useEffect, useState } from "react"
import { supabase  } from "@/lib/supabase"
import PostCard from "./PostCard"

export default function PostList(){
    const [posts, setPosts] = useState<any[]>([])

    useEffect(() => {
        const fetchPosts = async () => {
            const { data, error } = await supabase.from("posts").select("*")
            if (!error && data){
                setPosts(data)
            }
        }
        fetchPosts()
    }, [])

    return (
        <div className="flex flex-col gap-4">
            {posts.map((post) => (
                <PostCard
                 key={post.id}
                 id={post.id}
                 title={post.title}
                 description={post.description}
                 image={post.image}
                 user={{
                    name: post.user.name,
                    username: post.user.username,
                    avatar: post.user.avatar,
                 }}
                 likes={post.initialLikes}
                 comments={post.comment}
                 tags={post.tags}
                 calories={post.calories}
                 timeAgo={post.timeAgo}

                 />
            ))}
        </div>
    )

        
        }