from datetime import datetime

from app import db


class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    image_filename = db.Column(db.String(255), nullable=False)
    caption = db.Column(db.Text, nullable=False, default="")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    likes = db.relationship(
        "Like",
        back_populates="post",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    comments = db.relationship(
        "Comment",
        back_populates="post",
        cascade="all, delete-orphan",
        order_by="Comment.created_at",
    )

    def like_count(self):
        return self.likes.count()

    def is_liked_by(self, visitor_id):
        return (
            self.likes.filter_by(visitor_id=visitor_id).first() is not None
        )


class Like(db.Model):
    __tablename__ = "likes"

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(
        db.Integer,
        db.ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
    )
    visitor_id = db.Column(db.String(64), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    post = db.relationship("Post", back_populates="likes")

    __table_args__ = (
        db.UniqueConstraint("post_id", "visitor_id", name="uq_post_visitor_like"),
    )


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(
        db.Integer,
        db.ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
    )
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    post = db.relationship("Post", back_populates="comments")
