import unittest
import sys
from indextank import ApiClient
from indextank.client import HttpException
from time import sleep

TEST_INDEX = "draft"
TEST_ID = 11

sc = ApiClient("http://:G3KvEnaw2bDdQc@d7q83.api.searchify.com/")
draft = sc.get_index(TEST_INDEX)
draft.delete_by_search("all:{}".format(TEST_ID))

print "Begin testing on index: {}".format(TEST_INDEX)
print "Each test document has field all = {}".format(TEST_ID)

DRAFT_INDEX_SIZE = 1000
DOCS_KEEP_SIZE = 300

print "{} documents will be created, and then the first {} will be purged".format(DRAFT_INDEX_SIZE, DRAFT_INDEX_SIZE - DOCS_KEEP_SIZE)

for i in range(DRAFT_INDEX_SIZE):
    try_again = True
    while try_again:
        try:
            draft.add_document(docid="doc{}".format(i), 
                           fields={"all":TEST_ID, "docid":"doc"+str(i)}, 
                           variables={0: i})
            try_again = False
        except HttpException as e:
            print e
            print "Retrying in 5 sec"
            sleep(5)
        

print "Test documents added"

## Let's not use it age
draft.add_function(1, "age")  # age is NOT reliable for sorting
draft.add_function(2, "-age+0*relevance") # age is NOT reliable for sorting

draft.add_function(3, "-doc.var[0]")
draft.add_function(4, "doc.var[0]")

class TestUtils(unittest.TestCase):

    def test_added_docs_size(self):
        self.assertEqual(draft.search("all:{}".format(TEST_ID))['matches'], DRAFT_INDEX_SIZE)

    def test_bulk_delete(self):
        draft.delete_by_search(query="all:{}".format(TEST_ID), start=DOCS_KEEP_SIZE, scoring_function=4)
        self.assertEqual(draft.search("all:{}".format(TEST_ID))['matches'], DOCS_KEEP_SIZE)

    def test_documents_conservation(self):
        is_conserved = [draft.search("docid:doc{}".format(i))['matches'] == 1 for i in range(DRAFT_INDEX_SIZE - DOCS_KEEP_SIZE, DRAFT_INDEX_SIZE)]
        print is_conserved
        self.assertEqual(all(is_conserved), True)

    def test_documents_removed(self):
        is_removed = [draft.search("docid:doc{}".format(i))['matches'] == 0 for i in range(DRAFT_INDEX_SIZE - DOCS_KEEP_SIZE)]
        print is_removed
        self.assertEqual(all(is_removed), True)

if __name__ == '__main__':
    unittest.main()
