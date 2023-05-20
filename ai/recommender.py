import sys
from gensim.models import Word2Vec
import warnings
warnings.filterwarnings(action='ignore', category=UserWarning, module='gensim')

def recommender(path, positive_list=None, negative_list=None, topn=20):
    # 모델 불러오기
    model = Word2Vec.load(path)
    # 추천 장학금 리스트
    recommend_scholarship_ls = []

    # 모델에서 탐색
    for scholarshipId, prob in model.wv.most_similar_cosmul(positive=positive_list, negative=negative_list, topn=topn):
        recommend_scholarship_ls.append(scholarshipId)
    print(recommend_scholarship_ls)
    return recommend_scholarship_ls

if __name__ == '__main__':
    inputs = sys.argv[1:]
    path = str(inputs[0])
    positive_ls = str(inputs[1])
    positive_list = positive_ls.split(",")
    topn = int(inputs[2])

    recommender(path=path, positive_list=positive_list, topn=topn)
